// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod networking;
mod version_manager;

use crate::version_manager::*;
use serde::Serialize;
use std::env;
use std::process::Command;
use tauri::{command, AppHandle, Emitter};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            initialize_app,
            launch_game,
            get_current_game_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
async fn initialize_app(app: AppHandle) -> Result<(), String> {
    let message = format!("Platform: {} {}", env::consts::OS, env::consts::ARCH);
    emit_event(&app, "infoLog", message);

    let use_https = match get_server_manifest().await {
        Ok((manifest, used_https)) => {
            emit_event(
                &app,
                "infoLog",
                format!(
                    "Connected successfully to the server. \n Current SWF version: {}\n Launcher connected via http{}",
                    manifest.current_game_version, if used_https {"s"} else {""}
                ),
            );
            used_https
        }
        Err(err) => {
            emit_event(&app, "infoLog", err.to_string());
            false
        }
    };

    if env::consts::OS != "macos" {
        let file_info = get_platform_flash_runtime(&app, &env::consts::OS)?;
        if !file_info.0.exists() {
            let log = "Downloading flash player for your platform...";
            emit_event(&app, "infoLog", log.to_string());
            download_runtime(&app, file_info, use_https).await?;
        }
    }

    Ok(())
}

#[command]
fn launch_game(
    app: AppHandle,
    build_name: &str,
    language: &str,
    token: Option<&str>,
    host: Option<&str>,
    port: Option<u16>,
) -> Result<(), String> {
    let (flash_runtime_path, _) = get_platform_flash_runtime(&app, &env::consts::OS)?;

    if !flash_runtime_path.exists() {
        eprintln!("cannot find file: {}", flash_runtime_path.display());
        return Err(format!(
            "cannot find flashplayer: {}",
            flash_runtime_path.display()
        ));
    }

    let swf_filename = match build_name {
        "stable" => "gameloader".to_string(),
        name     => format!("bymr-{}", name),
    };

    let mut swf_url = format!(
        "http://{}{}.swf?language={}",
        SWFS_URL,
        swf_filename,
        language.to_lowercase()
    );

    // Append token to the URL if it exists
    if let Some(token) = token {
        swf_url = format!("{}&token={}", swf_url, token);
    }

    // For local builds, pass the server URL as a FlashVar so the SWF knows where to connect
    if build_name == "local" {
        swf_url = format!("{}&serverUrl=http://{}:{}/", swf_url, host.unwrap_or("localhost"), port.unwrap_or(3001));
    }

    println!("Opening: {:?}, {:?}", flash_runtime_path, swf_url);

    // Open the game in Flash Player
    Command::new(&flash_runtime_path)
        .arg(&swf_url)
        .env_remove("LD_LIBRARY_PATH") // On Linux, clear LD_LIBRARY_PATH so the AppImage's bundled GLib doesn't shadow the system GLib that flashplayer's GTK2 dependency requires
        .spawn()
        .map_err(|err| {
            format!(
                "[BYMR LAUNCHER] Failed to start BYMR build with error {:?}",
                err
            )
        })?;

    Ok(())
}

#[command]
async fn get_current_game_version() -> Result<String, String> {
    match get_server_manifest().await {
        Ok((manifest, _)) => Ok(manifest.current_game_version),
        Err(err) => Err(err.to_string()),
    }
}

#[derive(Clone, Serialize)]
struct EventLog {
    message: String,
}

fn emit_event(app: &AppHandle, event_type: &str, message: String) {
    app.emit(event_type, EventLog { message }).unwrap();
}
