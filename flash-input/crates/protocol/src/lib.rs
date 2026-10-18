//! Names shared by `bymr-player.exe` and the DLL it loads into the Flash Player.

use windows_sys::core::{PCSTR, PCWSTR, s, w};

/// File name of the DLL, which sits beside `bymr-player.exe`.
pub const DLL_NAME: &str = "bymr_input.dll";

/// Exported name of the DLL's `WH_GETMESSAGE` hook procedure.
pub const HOOK_PROC_NAME: PCSTR = s!("BymrInputHook");

/// Registered message the launcher posts to the player's UI thread to request
/// installation. `wParam` is the launcher thread to answer, with the same
/// message carrying a Win32 error code in `wParam`. A non-zero `lParam` also
/// asks for [`STATS_MESSAGE`] reports.
pub const INSTALL_MESSAGE: PCWSTR = w!("BymrInputInstall");

/// Registered message the DLL posts to the launcher thread once a second.
/// `wParam` is the number of early wake-ups delivered in that second and
/// `lParam` the average time, in microseconds, from the player deferring to it
/// touching its timer again.
pub const STATS_MESSAGE: PCWSTR = w!("BymrInputStats");
