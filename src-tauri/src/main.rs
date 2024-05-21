// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_manager;
mod version_manager;

use serde::{Deserialize, Serialize};
use std::env;
use tauri::{AppHandle, Manager};
use version_manager::{
    do_all_swfs_exist, download_swfs, get_version_info, local_files_status, VersionManifest,
};

#[derive(Clone, Serialize)]
struct Payload {
    message: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct InitialInfo {
    platform: String,
    architecture: String,
    manifest: VersionManifest,
}

struct App {
    // Define your application state and context here
}

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("failed to run app");
}

#[tauri::command]
async fn initialize_app(app: AppHandle) -> Result<(), String> {
    //Err("An error occurred during initialization".to_string());

    // Get OS info
    let message = format!("Platform: {} {}", env::consts::OS, env::consts::ARCH);
    app.emit_all(
        "infoLog",
        Payload {
            message: message.to_string(),
        },
    )
    .unwrap();

    let server_manifest = match get_version_info().await {
        Ok(manifest) => manifest,
        Err(err) => {
            app.emit_all("infoLog", Payload {
              message: "Server manifest could not be retrieved. Please check your internet connection.".to_string(),
          }).unwrap();
            return Err(err.to_string());
        }
    };

    app.emit_all(
        "initialLoad",
        InitialInfo {
            platform: env::consts::OS.to_string(),
            architecture: env::consts::ARCH.to_string(),
            manifest: server_manifest.clone(),
        },
    );

    let (local_manifest_exists, local_manifest, err) = local_files_status();

    let no_local_manifest = !local_manifest_exists || !err.is_empty();

    let should_refresh_builds = no_local_manifest
        || server_manifest.current_game_version != local_manifest.current_game_version
        || !do_all_swfs_exist(
            &server_manifest.builds,
            &server_manifest.current_game_version,
        );

    if should_refresh_builds {
        // Download SWFs
        app.emit_all(
            "infoLog",
            Payload {
                message: "Downloading latest SWFs".to_string(),
            },
        )
        .unwrap();

        if let Err(err) = download_swfs(
            &server_manifest.builds,
            &server_manifest.current_game_version,
            server_manifest.https_worked,
        ) {
            app.emit_all(
                "infoLog",
                Payload {
                    message: format!("Could not download latest swfs {}", err).to_string(),
                },
            )
            .unwrap();
        }
    }

    Ok(())
}
