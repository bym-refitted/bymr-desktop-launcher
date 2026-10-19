//! Launches Flash Player through the Windows input scheduling fix in flash-input/.
//!
//! The Windows release build bundles bymr-player.exe and bymr_input.dll as resources
//! (see tauri.flash-input.conf.json). The player wrapper starts Flash Player and loads the
//! DLL into it, cutting Flash's 10 ms input deferral to about 1 ms. Any failure falls back to
//! starting Flash Player directly, so the fix can never stop the game from launching. That
//! includes antivirus software stopping the wrapper after it has started, since loading a DLL
//! into another process is what behaviour monitoring looks for.

use std::io::{self, BufRead, BufReader, Read};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, RecvTimeoutError, Sender};
use std::thread;
use std::time::{Duration, Instant};

use tauri::{AppHandle, Emitter, Manager};

use crate::EventLog;

const WRAPPER_RESOURCE: &str = "flash-input/bymr-player.exe";

const DLL_RESOURCE: &str = "flash-input/bymr_input.dll";

/// Start of the line the wrapper prints once Flash Player is running, with or without the fix.
const STARTED_REPORT: &str = "Flash Player PID ";

/// How long to wait for that line: the wrapper waits up to 15 s for Flash Player to become
/// ready, then up to 15 s for the DLL to answer.
const STARTUP_TIMEOUT: Duration = Duration::from_secs(35);

/// A wrapper that fails within this long of reporting is treated as stopped by antivirus
/// software, which can act a moment after the DLL loads.
const EARLY_EXIT: Duration = Duration::from_secs(15);

#[derive(Default)]
pub struct InputFixSetting(AtomicBool);

impl InputFixSetting {
    pub fn set(&self, enabled: bool) {
        self.0.store(enabled, Ordering::Relaxed);
    }

    pub fn enabled(&self) -> bool {
        self.0.load(Ordering::Relaxed)
    }
}

/// Returns the bundled wrapper when the fix is enabled and both of its files are installed.
pub fn bundled_wrapper(app: &AppHandle) -> Option<PathBuf> {
    if !cfg!(windows) || !app.state::<InputFixSetting>().enabled() {
        return None;
    }
    let resources = app.path().resource_dir().ok()?;
    let wrapper = resources.join(WRAPPER_RESOURCE);
    (wrapper.is_file() && resources.join(DLL_RESOURCE).is_file()).then_some(wrapper)
}

/// Starts bymr-player.exe <flash runtime> <swf url> without a console window and relays its
/// output ("input scheduling fix active", or why not) to the launcher's Activity Logs.
///
/// The wrapper stays running until Flash Player exits, and closes Flash Player if it is stopped.
/// An error means the wrapper could not be started, and the caller should start Flash directly.
/// If the wrapper fails before reporting that Flash Player is running, or within [`EARLY_EXIT`]
/// of it, for example because antivirus software stopped it, `fallback` is called on a
/// background thread to do the same.
pub fn launch(
    app: &AppHandle,
    wrapper: &Path,
    flash_runtime: &Path,
    swf_url: &str,
    fallback: impl FnOnce() + Send + 'static,
) -> io::Result<()> {
    let mut command = Command::new(wrapper);
    command
        // The runtime path is relative to the launcher's working directory; the wrapper checks
        // the binary type before starting it, so hand it an absolute path.
        .arg(std::path::absolute(flash_runtime)?)
        .arg(swf_url)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = command.spawn()?;
    let (started, startup) = mpsc::channel();
    forward_output(app, child.stdout.take(), started.clone());
    forward_output(app, child.stderr.take(), started);

    let app = app.clone();
    thread::spawn(move || {
        let report = startup.recv_timeout(STARTUP_TIMEOUT);
        let reported_at = Instant::now();
        let status = child.wait();

        // A normal close exits with Flash Player's own code, 0. A wrapper stopped before it
        // reported, or shortly after, took its Flash Player down with it through the job object.
        let stopped = !status.as_ref().is_ok_and(|status| status.success());
        let stopped_early = match report {
            // Both output streams close when the wrapper exits, which disconnects the channel.
            Err(RecvTimeoutError::Disconnected) => true,
            Ok(()) => reported_at.elapsed() <= EARLY_EXIT,
            Err(RecvTimeoutError::Timeout) => false,
        };
        if stopped && stopped_early {
            let status = status.map_or_else(|err| err.to_string(), |status| status.to_string());
            let message = format!(
                "Input fix stopped while starting Flash Player ({status}), possibly by antivirus software. Launching Flash Player directly."
            );
            let _ = app.emit("infoLog", EventLog { message });
            fallback();
        }
    });
    Ok(())
}

/// Relays one wrapper output stream to the Activity Logs until the game closes, and signals
/// `started` once the wrapper reports that Flash Player is running. Emit errors are ignored:
/// the launcher window may be gone by then.
fn forward_output(app: &AppHandle, stream: Option<impl Read + Send + 'static>, started: Sender<()>) {
    let Some(stream) = stream else { return };
    let app = app.clone();
    thread::spawn(move || {
        for line in BufReader::new(stream).lines().map_while(Result::ok) {
            if line.starts_with(STARTED_REPORT) {
                let _ = started.send(());
            }
            let _ = app.emit("infoLog", EventLog { message: line });
        }
    });
}
