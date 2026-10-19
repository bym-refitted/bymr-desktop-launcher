//! Input scheduling fix for the standalone Windows Flash Player.
//!
//! The player defers input handling with `SetTimer(window, 1, 0, NULL)`, which
//! Windows clamps to at least 10 ms. This DLL is loaded into the player by
//! `bymr-player.exe`, replaces the player's `SetTimer` and `KillTimer` imports,
//! and delivers that timer's `WM_TIMER` after one millisecond instead.
//!
//! It also replaces `PostQuitMessage`. A posted `WM_TIMER` is retrieved before `WM_QUIT`, unlike
//! the timer's own, and the player's handler for it peeks with `PM_REMOVE`, which takes and
//! discards `WM_QUIT` whatever the filter. The player then keeps running with no window, so no
//! early wake may be left in the queue once it asks to quit.
//!
//! Requires Windows 10 version 1803 or later for high-resolution waitable timers.

#[cfg(not(all(windows, target_pointer_width = "32")))]
compile_error!("bymr-input targets the 32-bit Flash Player: build for i686-pc-windows-msvc");

mod imports;

use std::ffi::c_void;
use std::mem::take;
use std::ptr::{null, null_mut};
use std::sync::atomic::{AtomicBool, AtomicPtr, Ordering};
use std::sync::{Mutex, MutexGuard, PoisonError};
use std::thread;
use std::time::{Duration, Instant};

use bymr_input_protocol::{INSTALL_MESSAGE, STATS_MESSAGE};
use windows_sys::Win32::Foundation::{
    ERROR_NOT_ENOUGH_MEMORY, ERROR_NOT_SUPPORTED, ERROR_SUCCESS, FALSE, GetLastError, HWND, LPARAM,
    LRESULT, WAIT_OBJECT_0, WIN32_ERROR, WPARAM,
};
use windows_sys::Win32::System::LibraryLoader::{
    GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS, GET_MODULE_HANDLE_EX_FLAG_PIN, GetModuleHandleExW,
};
use windows_sys::Win32::System::Threading::{
    CREATE_WAITABLE_TIMER_HIGH_RESOLUTION, CancelWaitableTimer, CreateWaitableTimerExW, INFINITE,
    SetWaitableTimer, TIMER_ALL_ACCESS, WaitForSingleObject,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, GetClassNameW, HC_ACTION, KillTimer, MSG, PM_REMOVE, PeekMessageW, PostMessageW,
    PostQuitMessage, PostThreadMessageW, RegisterWindowMessageW, SetTimer, TIMERPROC, WM_QUIT,
    WM_TIMER,
};

use imports::{find_user32_import, replace_import};

const INPUT_TIMER_ID: usize = 1;
const SCHEDULER_WINDOW_CLASS: &str = "Messaging";

/// Relative one millisecond, in 100 ns units.
const WAKE_DELAY: i64 = -10_000;

static INSTALL_ATTEMPTED: AtomicBool = AtomicBool::new(false);
static WAKE_TIMER: AtomicPtr<c_void> = AtomicPtr::new(null_mut());

/// Window owed an early `WM_TIMER` when the wake timer fires, or null.
static PENDING_WAKE: AtomicPtr<c_void> = AtomicPtr::new(null_mut());

/// Window the last early wake was scheduled for, or null.
static WAKE_WINDOW: AtomicPtr<c_void> = AtomicPtr::new(null_mut());

/// Set once the player asks to quit. No early wake is delivered after that.
static QUITTING: AtomicBool = AtomicBool::new(false);

/// Held while an early wake is posted, so that quitting cannot miss one in flight.
static POSTING: Mutex<()> = Mutex::new(());

/// Set when the launcher asks for statistics. Nothing is counted otherwise.
static STATS_ENABLED: AtomicBool = AtomicBool::new(false);
static STATS: Mutex<Stats> = Mutex::new(Stats {
    deferred: None,
    deferrals: 0,
    deferred_for: Duration::ZERO,
    wakes: 0,
});

/// Counters reported to the launcher, reset after each report.
struct Stats {
    /// Window and start time of the deferral the player has not yet resumed from.
    deferred: Option<(usize, Instant)>,
    deferrals: u32,
    deferred_for: Duration,
    wakes: u32,
}

fn stats() -> Option<MutexGuard<'static, Stats>> {
    STATS_ENABLED
        .load(Ordering::Relaxed)
        .then(|| STATS.lock().unwrap_or_else(PoisonError::into_inner))
}

/// `WH_GETMESSAGE` hook the launcher installs on the player's UI thread. It
/// only exists to run [`install`] inside the player, on that thread.
///
/// # Safety
/// Must only be called by Windows as a `GetMsgProc`, inside the 32-bit Flash Player.
#[unsafe(no_mangle)]
pub unsafe extern "system" fn BymrInputHook(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code == HC_ACTION as i32 && !INSTALL_ATTEMPTED.load(Ordering::Relaxed) {
        let message = unsafe { &*(lparam as *const MSG) };
        let install_message = unsafe { RegisterWindowMessageW(INSTALL_MESSAGE) };

        if message.hwnd.is_null()
            && message.message == install_message
            && !INSTALL_ATTEMPTED.swap(true, Ordering::Relaxed)
        {
            let launcher_thread = message.wParam as u32;
            let result = unsafe { install() };

            if result.is_ok() && message.lParam != 0 {
                STATS_ENABLED.store(true, Ordering::Relaxed);
                let _ = thread::Builder::new().spawn(move || report_stats(launcher_thread));
            }

            let error = result.err().unwrap_or(ERROR_SUCCESS);
            unsafe { PostThreadMessageW(launcher_thread, message.message, error as WPARAM, 0) };
        }
    }

    unsafe { CallNextHookEx(null_mut(), code, wparam, lparam) }
}

/// Replaces the player's timer imports and starts the wake thread.
///
/// # Safety
/// The process executable must be a loaded 32-bit PE image.
unsafe fn install() -> Result<(), WIN32_ERROR> {
    let set_timer_slot = unsafe { find_user32_import(c"SetTimer") }.ok_or(ERROR_NOT_SUPPORTED)?;
    let kill_timer_slot = unsafe { find_user32_import(c"KillTimer") }.ok_or(ERROR_NOT_SUPPORTED)?;
    let post_quit_slot =
        unsafe { find_user32_import(c"PostQuitMessage") }.ok_or(ERROR_NOT_SUPPORTED)?;

    let timer = unsafe {
        CreateWaitableTimerExW(
            null(),
            null(),
            CREATE_WAITABLE_TIMER_HIGH_RESOLUTION,
            TIMER_ALL_ACCESS,
        )
    };

    if timer.is_null() {
        return Err(last_error());
    }

    WAKE_TIMER.store(timer, Ordering::Relaxed);

    // The launcher removes its hook once installation is reported. Keep this DLL
    // loaded for the lifetime of the import pointers and the wake thread.
    let mut module = null_mut();
    let pinned = unsafe {
        GetModuleHandleExW(
            GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_PIN,
            install as *const u16,
            &mut module,
        )
    };

    if pinned == 0 {
        return Err(last_error());
    }

    thread::Builder::new()
        .spawn(deliver_wakes)
        .map_err(|error| {
            error
                .raw_os_error()
                .map_or(ERROR_NOT_ENOUGH_MEMORY, |code| code as WIN32_ERROR)
        })?;

    // Replace the quit path first, so the early wakes never run without it.
    unsafe {
        replace_import(post_quit_slot, post_quit_message as *mut c_void)?;
        replace_import(set_timer_slot, set_timer as *mut c_void)?;
        if let Err(error) = replace_import(kill_timer_slot, kill_timer as *mut c_void) {
            let _ = replace_import(set_timer_slot, SetTimer as *mut c_void);
            return Err(error);
        }
    }

    Ok(())
}

fn last_error() -> WIN32_ERROR {
    unsafe { GetLastError() }
}

/// Posts the pending `WM_TIMER` each time the wake timer fires. The player
/// handles it on its own UI thread; nothing else runs on this thread.
fn deliver_wakes() {
    let timer = WAKE_TIMER.load(Ordering::Relaxed);
    while unsafe { WaitForSingleObject(timer, INFINITE) } == WAIT_OBJECT_0 {
        let window = PENDING_WAKE.swap(null_mut(), Ordering::AcqRel);
        let _posting = POSTING.lock().unwrap_or_else(PoisonError::into_inner);

        if !window.is_null() && !QUITTING.load(Ordering::Acquire) {
            unsafe { PostMessageW(window, WM_TIMER, INPUT_TIMER_ID, 0) };
            if let Some(mut stats) = stats() {
                stats.wakes += 1;
            }
        }
    }
}

/// Posts the last second's [`Stats`] to the launcher, and stops counting once
/// the launcher has gone away.
fn report_stats(launcher_thread: u32) {
    let stats_message = unsafe { RegisterWindowMessageW(STATS_MESSAGE) };
    loop {
        thread::sleep(Duration::from_secs(1));

        let Some((wakes, deferrals, deferred_for)) = stats().map(|mut stats| {
            (
                take(&mut stats.wakes),
                take(&mut stats.deferrals),
                take(&mut stats.deferred_for),
            )
        }) else {
            break;
        };
        let average_micros = deferred_for
            .checked_div(deferrals)
            .map_or(0, |average| average.as_micros());

        let posted = unsafe {
            PostThreadMessageW(
                launcher_thread,
                stats_message,
                wakes as WPARAM,
                average_micros as LPARAM,
            )
        };
        if posted == 0 {
            STATS_ENABLED.store(false, Ordering::Relaxed);
        }
    }
}

/// Times a deferral from the player setting its timer to touching it again.
fn end_deferral(window: HWND) {
    if let Some(mut stats) = stats()
        && let Some((deferred_window, started)) = stats.deferred
        && deferred_window == window as usize
    {
        stats.deferred = None;
        stats.deferrals += 1;
        stats.deferred_for += started.elapsed();
    }
}

fn cancel_pending_wake(window: HWND, id: usize) {
    if id != INPUT_TIMER_ID {
        return;
    }
    end_deferral(window);

    if PENDING_WAKE
        .compare_exchange(window, null_mut(), Ordering::AcqRel, Ordering::Relaxed)
        .is_ok()
    {
        unsafe { CancelWaitableTimer(WAKE_TIMER.load(Ordering::Relaxed)) };
    }
}

fn is_input_deferral(window: HWND, id: usize, delay: u32, callback: TIMERPROC) -> bool {
    if window.is_null() || id != INPUT_TIMER_ID || delay != 0 || callback.is_some() {
        return false;
    }

    let mut class_name = [0u16; 64];
    let length = unsafe { GetClassNameW(window, class_name.as_mut_ptr(), class_name.len() as i32) };
    class_name[..length as usize]
        .iter()
        .copied()
        .eq(SCHEDULER_WINDOW_CLASS.encode_utf16())
}

unsafe extern "system" fn set_timer(
    window: HWND,
    id: usize,
    delay: u32,
    callback: TIMERPROC,
) -> usize {
    if QUITTING.load(Ordering::Acquire) || !is_input_deferral(window, id, delay, callback) {
        cancel_pending_wake(window, id);
        return unsafe { SetTimer(window, id, delay, callback) };
    }

    end_deferral(window);

    // Keep the original timer as a fallback if the extra wake cannot be delivered.
    let timer_id = unsafe { SetTimer(window, id, delay, callback) };
    if timer_id != 0 {
        if let Some(mut stats) = stats() {
            stats.deferred = Some((window as usize, Instant::now()));
        }

        // SetTimer(0) is clamped to >=10 ms. Give the player a brief input yield
        // using a high-resolution timer, then deliver its existing notification.
        WAKE_WINDOW.store(window, Ordering::Relaxed);
        PENDING_WAKE.store(window, Ordering::Release);
        let timer = WAKE_TIMER.load(Ordering::Relaxed);
        if unsafe { SetWaitableTimer(timer, &WAKE_DELAY, 0, None, null(), FALSE) } == 0 {
            PENDING_WAKE.store(null_mut(), Ordering::Release);
        }
    }

    timer_id
}

/// Stops early wakes and removes any already posted before the player quits, so that
/// `WM_QUIT` is the next message it retrieves, as without this DLL.
///
/// Runs on the player's UI thread, which owns the queue being drained.
unsafe extern "system" fn post_quit_message(exit_code: i32) {
    {
        let _posting = POSTING.lock().unwrap_or_else(PoisonError::into_inner);
        QUITTING.store(true, Ordering::Release);
    }
    if !PENDING_WAKE.swap(null_mut(), Ordering::AcqRel).is_null() {
        unsafe { CancelWaitableTimer(WAKE_TIMER.load(Ordering::Relaxed)) };
    }

    let window = WAKE_WINDOW.load(Ordering::Relaxed);
    let mut message = MSG::default();
    while !window.is_null()
        && unsafe { PeekMessageW(&mut message, window, WM_TIMER, WM_TIMER, PM_REMOVE) } != 0
    {
        // An earlier quit request is also returned whatever the filter: keep it.
        if message.message == WM_QUIT {
            unsafe { PostQuitMessage(message.wParam as i32) };
            break;
        }
    }

    unsafe { PostQuitMessage(exit_code) }
}

unsafe extern "system" fn kill_timer(window: HWND, id: usize) -> i32 {
    cancel_pending_wake(window, id);
    unsafe { KillTimer(window, id) }
}
