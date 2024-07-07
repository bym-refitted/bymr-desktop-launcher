// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod networking;
mod version_manager;

use crate::version_manager::*;
use serde::Serialize;
use std::env;
use std::process::Command;
use tauri::{command, AppHandle, Manager};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![initialize_app, launch_game])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
async fn initialize_app(app: AppHandle) -> Result<(), String> {
    let message = format!("Platform: {} {}", env::consts::OS, env::consts::ARCH); // Get OS info
    emit_event(&app, "infoLog", message);

    let manifest_result: Result<VersionManifest, _> = get_server_manifest().await;
    let use_https = match manifest_result {
        Ok(manifest) => {
            emit_event(
                &app,
                "infoLog",
                format!(
                    "Connected successfully to the server. \n Current SWF version: {}\n Launcher connected via http{}",
                    manifest.current_game_version, if manifest.https_worked {"s"} else {""}
                ),
            );
            manifest.https_worked
        }
        Err(err) => {
            emit_event(&app, "infoLog", err.to_string());
            false
        }
    };

    let file_info = get_platform_flash_runtime(&env::consts::OS)?;
    if !file_info.0.exists() {
        let log = "Downloading flash player for your platform...";
        emit_event(&app, "infoLog", log.to_string());
        download_runtime(file_info, use_https).await?;
    }

    Ok(())
}

#[command]
fn launch_game(build_name: &str) -> Result<(), String> {
    let (flash_runtime_path, _) = get_platform_flash_runtime(&env::consts::OS)?;

    if !flash_runtime_path.exists() {
        eprintln!("cannot find file: {}", flash_runtime_path.display());
        return Err(format!(
            "cannot find flashplayer: {}",
            flash_runtime_path.display()
        ));
    }
    let swf_url = format!(
        "http{}://{}bymr-{}.swf",
        if build_name == "stable" { "s" } else { "" },
        LAUNCHER_DOWNLOADS_URL,
        build_name
    );
    println!("Opening: {:?}, {:?}", flash_runtime_path, swf_url);

    // Open the game in Flash Player
    Command::new(&flash_runtime_path)
        .arg(&swf_url)
        .spawn()
        .map_err(|err| {
            format!(
                "[BYMR LAUNCHER] Failed to start BYMR build {}: {:?}",
                build_name, err
            )
        })?;

    Ok(())
}

#[derive(Clone, Serialize)]
struct EventLog {
    message: String,
}

pub fn emit_event(app: &AppHandle, event_type: &str, message: String) {
    app.emit_all(event_type, EventLog { message }).unwrap();
}
