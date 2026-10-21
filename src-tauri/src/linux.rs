//! Linux-only workarounds for the WebKitGTK webview the launcher's window is drawn with.

use std::env;

/// Sets environment variables that keep WebKitGTK working on problematic setups. Must run
/// before Tauri starts GTK, and leaves any value the player set themselves untouched.
///
/// - `__NV_DISABLE_EXPLICIT_SYNC`: NVIDIA's explicit sync on Wayland makes WebKitGTK crash
///   with "Error 71 (Protocol error) dispatching to Wayland display".
pub fn prepare_environment() {
    if env::var_os("__NV_DISABLE_EXPLICIT_SYNC").is_none() {
        unsafe { env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1") };
    }
}
