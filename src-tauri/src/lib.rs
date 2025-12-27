mod networking;
mod version_manager;

use crate::version_manager::*;
use serde::Serialize;
use std::env;
use tauri::{command, AppHandle, Emitter, Builder};

#[cfg(desktop)]
use std::process::Command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = Builder::default();
    
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }
    
    builder
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
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

    // Server manifest check works on all platforms
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

    #[cfg(desktop)]
    {
        let file_info = get_platform_flash_runtime(&app, &env::consts::OS)?;
        if !file_info.0.exists() {
            emit_event(&app, "infoLog", "Downloading flash player...".to_string());
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
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let (flash_runtime_path, _) = get_platform_flash_runtime(&app, &env::consts::OS)?;

        if !flash_runtime_path.exists() {
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

        if let Some(token) = token {
            swf_url = format!("{}&token={}", swf_url, token);
        }

        println!("Opening: {:?}, {:?}", flash_runtime_path, swf_url);

        Command::new(&flash_runtime_path)
            .arg(&swf_url)
            .spawn()
            .map_err(|err| {
                format!(
                    "[BYMR LAUNCHER] Failed to start BYMR build with error {:?}",
                    err
                )
            })?;
    }

    #[cfg(mobile)]
    {
        return Err(
            "TODO: Implement mobile launch".to_string(),
        );
    }

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
