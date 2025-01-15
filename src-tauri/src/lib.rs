mod networking;
mod version_manager;

use crate::version_manager::*;
use serde::Serialize;
use std::env;
use std::process::Command;
use tauri::{command, AppHandle, Emitter};

#[cfg(desktop)]
pub fn run_desktop() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            initialize_desktop_app,
            launch_desktop_game,
            get_current_game_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run_mobile() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            initialize_android_app,
            launch_android_game,
            get_current_game_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(desktop)]
#[command]
async fn initialize_desktop_app(app: AppHandle) -> Result<(), String> {
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

    let file_info = get_platform_flash_runtime(&app, &env::consts::OS)?;
    if !file_info.0.exists() {
        let log = "Downloading flash player for your platform...";
        emit_event(&app, "infoLog", log.to_string());
        download_runtime(&app, file_info, use_https).await?;
    }

    Ok(())
}

#[command]
async fn initialize_android_app(app: AppHandle) -> Result<(), String> {
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

    // TODO: Do we need to get flash player for android? I think we should check for
    // android apk here

    // let file_info = get_platform_flash_runtime(&app, &env::consts::OS)?;
    // if !file_info.0.exists() {
    //     let log = "Downloading flash player for your platform...";
    //     emit_event(&app, "infoLog", log.to_string());
    //     download_runtime(&app, file_info, use_https).await?;
    // }

    Ok(())
}

#[cfg(desktop)]
#[command]
fn launch_desktop_game(
    app: AppHandle,
    build_name: &str,
    language: &str,
    token: Option<&str>,
) -> Result<(), String> {
    let (flash_runtime_path, _) = get_platform_flash_runtime(&app, &env::consts::OS)?;

    if !flash_runtime_path.exists() {
        eprintln!("cannot find file: {}", flash_runtime_path.display());
        return Err(format!(
            "cannot find flashplayer: {}",
            flash_runtime_path.display()
        ));
    }

    let mut swf_url = format!(
        "http{}://{}bymr-{}.swf?language={}",
        if build_name == "http" || build_name == "local" {
            ""
        } else {
            "s"
        },
        SWFS_URL,
        build_name,
        language.to_lowercase()
    );

    // Append token to the URL if it exists
    if let Some(token) = token {
        swf_url = format!("{}&token={}", swf_url, token);
    }

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

#[command]
fn launch_android_game(
    app: AppHandle,
    build_name: &str,
    language: &str,
    token: Option<&str>,
) -> Result<(), String> {
    let (flash_runtime_path, _) = get_platform_flash_runtime(&app, &env::consts::OS)?;

    if !flash_runtime_path.exists() {
        eprintln!("cannot find file: {}", flash_runtime_path.display());
        return Err(format!(
            "cannot find flashplayer: {}",
            flash_runtime_path.display()
        ));
    }

    let mut swf_url = format!(
        "http{}://{}bymr-{}.swf?language={}",
        if build_name == "http" || build_name == "local" {
            ""
        } else {
            "s"
        },
        SWFS_URL,
        build_name,
        language.to_lowercase()
    );

    // Append token to the URL if it exists
    if let Some(token) = token {
        swf_url = format!("{}&token={}", swf_url, token);
    }

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
