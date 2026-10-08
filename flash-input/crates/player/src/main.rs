//! Starts the standalone Flash Player with the input scheduling fix installed.
//!
//! Usage: `bymr-player.exe <flashplayer.exe> <game.swf>`

use std::env;
use std::ffi::{OsStr, c_void};
use std::io;
use std::iter::{once, repeat_n};
use std::mem::transmute;
use std::os::windows::ffi::OsStrExt;
use std::os::windows::io::{AsRawHandle, FromRawHandle, OwnedHandle};
use std::process;
use std::ptr::{null, null_mut};

use bymr_input_protocol::{DLL_NAME, HOOK_PROC_NAME, INSTALL_MESSAGE, STATS_MESSAGE};
use windows_sys::Win32::Foundation::{
    CloseHandle, ERROR_SUCCESS, FALSE, FARPROC, HMODULE, WAIT_OBJECT_0,
};
use windows_sys::Win32::Storage::FileSystem::GetBinaryTypeW;
use windows_sys::Win32::System::JobObjects::{
    AssignProcessToJobObject, CreateJobObjectW, JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
    JOBOBJECT_EXTENDED_LIMIT_INFORMATION, JobObjectExtendedLimitInformation,
    SetInformationJobObject,
};
use windows_sys::Win32::System::LibraryLoader::{
    GetProcAddress, LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR, LOAD_LIBRARY_SEARCH_SYSTEM32, LoadLibraryExW,
};
use windows_sys::Win32::System::Threading::{
    CreateProcessW, GetCurrentThreadId, GetExitCodeProcess, INFINITE, PROCESS_INFORMATION,
    STARTUPINFOW, WaitForInputIdle,
};
use windows_sys::Win32::System::WindowsProgramming::SCS_32BIT_BINARY;
use windows_sys::Win32::UI::WindowsAndMessaging::{
    HOOKPROC, MSG, MsgWaitForMultipleObjects, PM_NOREMOVE, PM_REMOVE, PeekMessageW,
    PostThreadMessageW, QS_POSTMESSAGE, RegisterWindowMessageW, SetWindowsHookExW,
    UnhookWindowsHookEx, WH_GETMESSAGE, WM_USER,
};

const STARTUP_TIMEOUT_MS: u32 = 15_000;

fn main() {
    let mut arguments: Vec<_> = env::args_os().skip(1).collect();
    let print_stats = arguments.first().is_some_and(|flag| flag == "--stats");
    if print_stats {
        arguments.remove(0);
    }
    let [player, swf] = arguments.as_slice() else {
        eprintln!("Usage: bymr-player.exe [--stats] <flashplayer.exe> <game.swf>");
        process::exit(2);
    };

    match run(player, swf, print_stats) {
        Ok(exit_code) => process::exit(exit_code as i32),
        Err(message) => {
            eprintln!("Flash Player launch failed: {message}.");
            process::exit(1);
        }
    }
}

/// Runs the player to completion and returns its exit code. Only failing to
/// start the player is an error: without the input fix it still runs normally.
fn run(player: &OsStr, swf: &OsStr, print_stats: bool) -> Result<u32, String> {
    let player_path = wide(player);
    let mut command = Vec::new();
    push_quoted(&mut command, player);
    command.push(u16::from(b' '));
    push_quoted(&mut command, swf);
    command.push(0);

    let startup = STARTUPINFOW {
        cb: size_of::<STARTUPINFOW>() as u32,
        ..Default::default()
    };
    let mut child = PROCESS_INFORMATION::default();
    let started = unsafe {
        CreateProcessW(
            player_path.as_ptr(),
            command.as_mut_ptr(),
            null(),
            null(),
            FALSE,
            0,
            null(),
            null(),
            &startup,
            &mut child,
        )
    };
    if started == 0 {
        return Err(os_error("starting Flash Player"));
    }
    let process = unsafe {
        CloseHandle(child.hThread);
        OwnedHandle::from_raw_handle(child.hProcess)
    };

    let _job = contain_in_job(&process)
        .inspect_err(|message| eprintln!("Flash Player will outlive this launcher: {message}."))
        .ok();

    // The player is already running, so a failed or slow install costs nothing.
    match install_input_fix(&player_path, &process, child.dwThreadId, print_stats) {
        Ok(()) => println!(
            "Flash Player PID {}: input scheduling fix active.",
            child.dwProcessId
        ),
        Err(message) => eprintln!(
            "Flash Player PID {}: running without the input scheduling fix: {message}.",
            child.dwProcessId
        ),
    }

    wait_for_exit(&process);

    let mut exit_code = 0;
    if unsafe { GetExitCodeProcess(process.as_raw_handle(), &mut exit_code) } == 0 {
        return Err(os_error("reading the player exit code"));
    }
    Ok(exit_code)
}

/// Waits for the player to exit, printing the statistics the DLL reports for
/// each second in which it woke the player early.
fn wait_for_exit(process: &OwnedHandle) {
    let process = process.as_raw_handle();
    let stats_message = unsafe { RegisterWindowMessageW(STATS_MESSAGE) };
    let mut stats = MSG::default();

    while unsafe { MsgWaitForMultipleObjects(1, &process, FALSE, INFINITE, QS_POSTMESSAGE) }
        == WAIT_OBJECT_0 + 1
    {
        while unsafe {
            PeekMessageW(
                &mut stats,
                null_mut(),
                stats_message,
                stats_message,
                PM_REMOVE,
            )
        } != 0
        {
            if stats.wParam != 0 {
                println!(
                    "Input fix: {} early wake-ups in the last second, player resumed {:.1} ms after deferring on average.",
                    stats.wParam,
                    stats.lParam as f64 / 1000.0
                );
            }
        }
    }
}

/// Puts the player in a job that closes it when this launcher exits or is stopped.
fn contain_in_job(process: &OwnedHandle) -> Result<OwnedHandle, String> {
    const ACTION: &str = "creating the player job";

    let job = unsafe { CreateJobObjectW(null(), null()) };
    if job.is_null() {
        return Err(os_error(ACTION));
    }
    let job = unsafe { OwnedHandle::from_raw_handle(job) };

    let mut limits = JOBOBJECT_EXTENDED_LIMIT_INFORMATION::default();
    limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
    let contained = unsafe {
        SetInformationJobObject(
            job.as_raw_handle(),
            JobObjectExtendedLimitInformation,
            (&raw const limits).cast::<c_void>(),
            size_of_val(&limits) as u32,
        ) != 0
            && AssignProcessToJobObject(job.as_raw_handle(), process.as_raw_handle()) != 0
    };
    if !contained {
        return Err(os_error(ACTION));
    }

    Ok(job)
}

/// Loads the DLL beside this executable. Windows needs it loaded here in order
/// to map it into the player when the hook is installed.
fn load_input_fix() -> Result<(HMODULE, HOOKPROC), String> {
    let path = env::current_exe()
        .map_err(|error| format!("locating the launcher ({error})"))?
        .with_file_name(DLL_NAME);
    let path = wide(path.as_os_str());

    let library = unsafe {
        LoadLibraryExW(
            path.as_ptr(),
            null_mut(),
            LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR | LOAD_LIBRARY_SEARCH_SYSTEM32,
        )
    };
    if library.is_null() {
        return Err(os_error(&format!("loading {DLL_NAME} beside the launcher")));
    }

    let hook_proc = unsafe { GetProcAddress(library, HOOK_PROC_NAME) };
    if hook_proc.is_none() {
        return Err(os_error("finding the input fix entry point"));
    }
    // SAFETY: the export is `BymrInputHook`, which has the HOOKPROC signature.
    Ok((library, unsafe {
        transmute::<FARPROC, HOOKPROC>(hook_proc)
    }))
}

/// Hooks the player's UI thread, asks the DLL to install itself there and
/// waits for its answer.
fn install_input_fix(
    player_path: &[u16],
    process: &OwnedHandle,
    ui_thread_id: u32,
    report_stats: bool,
) -> Result<(), String> {
    const ACTION: &str = "initializing the input fix";

    let mut binary_type = 0;
    let is_executable = unsafe { GetBinaryTypeW(player_path.as_ptr(), &mut binary_type) } != 0;
    if !is_executable || binary_type != SCS_32BIT_BINARY {
        return Err("a 32-bit Windows Flash Player is required".into());
    }
    let (library, hook_proc) = load_input_fix()?;

    // A thread-specific hook needs the child's message queue to exist first.
    if unsafe { WaitForInputIdle(process.as_raw_handle(), STARTUP_TIMEOUT_MS) } != 0 {
        return Err(format!("{ACTION} (Flash Player did not become ready)"));
    }

    // Peeking creates this thread's message queue, which receives the answer.
    let mut answer = MSG::default();
    let install_message = unsafe {
        PeekMessageW(&mut answer, null_mut(), WM_USER, WM_USER, PM_NOREMOVE);
        RegisterWindowMessageW(INSTALL_MESSAGE)
    };

    let hook = unsafe { SetWindowsHookExW(WH_GETMESSAGE, hook_proc, library, ui_thread_id) };
    if hook.is_null() {
        return Err(os_error(ACTION));
    }

    let requested = unsafe {
        PostThreadMessageW(
            ui_thread_id,
            install_message,
            GetCurrentThreadId() as usize,
            report_stats as isize,
        )
    };
    let result = if requested == 0 {
        Err(os_error(ACTION))
    } else {
        wait_for_answer(process, install_message, &mut answer)
            .map_err(|error| format!("{ACTION} ({error})"))
    };

    unsafe { UnhookWindowsHookEx(hook) };
    result
}

fn wait_for_answer(
    process: &OwnedHandle,
    install_message: u32,
    answer: &mut MSG,
) -> io::Result<()> {
    let process = process.as_raw_handle();
    loop {
        let answered = unsafe {
            PeekMessageW(
                answer,
                null_mut(),
                install_message,
                install_message,
                PM_REMOVE,
            )
        };
        if answered != 0 {
            return match answer.wParam as u32 {
                ERROR_SUCCESS => Ok(()),
                error => Err(io::Error::from_raw_os_error(error as i32)),
            };
        }

        let woken_by = unsafe {
            MsgWaitForMultipleObjects(1, &process, FALSE, STARTUP_TIMEOUT_MS, QS_POSTMESSAGE)
        };
        if woken_by == WAIT_OBJECT_0 {
            return Err(io::Error::other("Flash Player exited"));
        }
        if woken_by != WAIT_OBJECT_0 + 1 {
            return Err(io::ErrorKind::TimedOut.into());
        }
    }
}

/// Appends `argument` to a command line, quoted the way Windows splits argv:
/// backslashes are doubled before a quote and at the end of the argument.
fn push_quoted(command: &mut Vec<u16>, argument: &OsStr) {
    const QUOTE: u16 = b'"' as u16;
    const BACKSLASH: u16 = b'\\' as u16;

    command.push(QUOTE);
    let mut backslashes = 0;
    for unit in argument.encode_wide() {
        if unit == BACKSLASH {
            backslashes += 1;
            continue;
        }
        let escapes = if unit == QUOTE {
            backslashes * 2 + 1
        } else {
            backslashes
        };
        command.extend(repeat_n(BACKSLASH, escapes));
        command.push(unit);
        backslashes = 0;
    }
    command.extend(repeat_n(BACKSLASH, backslashes * 2));
    command.push(QUOTE);
}

fn wide(value: &OsStr) -> Vec<u16> {
    value.encode_wide().chain(once(0)).collect()
}

fn os_error(action: &str) -> String {
    format!("{action} ({})", io::Error::last_os_error())
}
