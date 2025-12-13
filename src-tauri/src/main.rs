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
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            initialize_app,
            launch_game,
            get_current_game_version
        ])
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                kill_all_flash_instances();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn kill_all_flash_instances() {
    #[cfg(target_os = "macos")]
    let _ = Command::new("killall").arg("Flash Player").output();
    
    // #[cfg(target_os = "windows")]
    // let _ = Command::new("taskkill").args(&["/F", "/IM", "flashplayer*.exe"]).output();
    
    // #[cfg(target_os = "linux")]
    // let _ = Command::new("killall").arg("flashplayer").output();
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

    // Download Flash runtime if it doesn't exist (non-blocking)
    let file_info = get_platform_flash_runtime(&app, &env::consts::OS)?;
    if !file_info.0.exists() {
        let log = "Downloading flash player for your platform...";
        emit_event(&app, "infoLog", log.to_string());
        
        // Try to download, but don't fail the entire initialization if it fails
        match download_runtime(&app, file_info, use_https).await {
            Ok(_) => emit_event(&app, "infoLog", "Flash Player downloaded successfully".to_string()),
            Err(err) => emit_event(&app, "errorLog", format!("Flash Player download failed: {}", err)),
        }
    }

    Ok(())
}

#[command]
fn launch_game(app: AppHandle, build_name: &str, language: &str, token: Option<&str>) -> Result<(), String> {
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
        _ => format!("bymr-{}", build_name),
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

    println!("Opening: {:?}, {:?}", flash_runtime_path, swf_url);

    // Kill any existing Flash instances before launching
    kill_all_flash_instances();

    // Open the game in Flash Player
    Command::new(&flash_runtime_path)
        .arg(&swf_url)
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
        Ok(manifest) => Ok(manifest.current_game_version),
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
