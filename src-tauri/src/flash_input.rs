//! Launches Flash Player through the Windows input scheduling fix in flash-input/.
//!
//! The Windows release build bundles bymr-player.exe and bymr_input.dll as resources
//! (see tauri.flash-input.conf.json). The player wrapper starts Flash Player and loads the
//! DLL into it, cutting Flash's 10 ms input deferral to about 1 ms. Any failure falls back to
//! starting Flash Player directly, so the fix can never stop the game from launching.

use std::io::{self, BufRead, BufReader, Read};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{AppHandle, Emitter, Manager};

use crate::EventLog;

const WRAPPER_RESOURCE: &str = "flash-input/bymr-player.exe";

const DLL_RESOURCE: &str = "flash-input/bymr_input.dll";

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
pub fn launch(app: &AppHandle, wrapper: &Path, flash_runtime: &Path, swf_url: &str) -> io::Result<()> {
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
    forward_output(app, child.stdout.take());
    forward_output(app, child.stderr.take());
    Ok(())
}

/// Relays one wrapper output stream to the Activity Logs until the game closes. Emit errors are
/// ignored: the launcher window may be gone by then.
fn forward_output(app: &AppHandle, stream: Option<impl Read + Send + 'static>) {
    let Some(stream) = stream else { return };
    let app = app.clone();
    std::thread::spawn(move || {
        for line in BufReader::new(stream).lines().map_while(Result::ok) {
            let _ = app.emit("infoLog", EventLog { message: line });
        }
    });
}
