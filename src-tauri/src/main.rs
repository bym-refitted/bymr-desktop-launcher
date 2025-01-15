// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub fn main() {
    if cfg!(target_os = "android") {
        bym_refitted_launcher_lib::run_mobile();
    } else {
        bym_refitted_launcher_lib::run_desktop();
    }
}
