// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_manager;
mod version_manager;

use crate::file_manager::{file_exists, set_local_versions};
use crate::version_manager::*;
use serde::{Deserialize, Serialize};
use std::env;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{command, AppHandle, Manager};

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![initialize_app, launch_game])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command] 
async fn initialize_app(app: AppHandle) -> Result<(), String> {
    println!("Application initialized");

    // Get OS info
    let message = format!("Platform: {} {}", env::consts::OS, env::consts::ARCH);
    emit_event(&app, message);

    let server_manifest = match get_version_info().await {
        Ok(manifest) => manifest,
        Err(err) => {
            let err_msg =
                "Server manifest could not be retrieved. Please check your internet connection.";
            emit_event(&app, err_msg.to_string());

            return Err(err.to_string());
        }
    };

    let _ = app.emit_all(
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

    // Download SWFs
    if should_refresh_builds {
        emit_event(&app, "Downloading latest SWFs".to_string());

        if let Err(err) = download_swfs(
            &server_manifest.builds,
            &server_manifest.current_game_version,
            server_manifest.https_worked,
        )
        .await
        {
            emit_event(&app, format!("Could not download latest swfs {}", err));
        }
    }

    let flash_runtime_file_name =
        match get_platform_flash_runtime(env::consts::OS, &server_manifest) {
            Ok(file_name) => file_name,
            Err(err) => {
                let err_msg = format!("Could not download latest flash runtime {}", err);
                emit_event(&app, err_msg);

                return Err(err);
            }
        };

    let binding = PathBuf::from(RUNTIME_FOLDER).join(&flash_runtime_file_name);
    let flash_runtime_path = binding.to_str().unwrap();

    if no_local_manifest || !file_exists(&flash_runtime_path) {
        let log = "Downloading flash player for your platform...";
        emit_event(&app, log.to_string());
        download_runtimes(&flash_runtime_file_name, server_manifest.https_worked).await?;
    }

    // Create an instance of LocalVersionManifest from serverManifest
    let local_manifest = LocalVersionManifest {
        current_game_version: server_manifest.current_game_version,
        current_launcher_version: server_manifest.current_launcher_version,
        builds: server_manifest.builds,
        flash_runtimes: server_manifest.flash_runtimes,
    };

    match set_local_versions(local_manifest).await {
        Ok(()) => println!("Local version manifest successfully written to file."),
        Err(err) => println!("Version manifest error: {}", err),
    }

    Ok(())
}

#[command]
fn launch_game(build_name: &str, version: &str, runtime: &str) -> Result<(), String> {
    let binding = PathBuf::from(".").join(RUNTIME_FOLDER).join(runtime);
    let flash_runtime_path = binding.to_str().unwrap();

    if !file_exists(&flash_runtime_path) {
        eprintln!("cannot find file: {}", flash_runtime_path);
        return Err(format!("cannot find flashplayer: {}", flash_runtime_path));
    }

    let binding = Path::new(".")
        .join(BUILD_FOLDER)
        .join(format!("bymr-{}-{}.swf", build_name, version));
    let swf_path = binding.to_str().unwrap();

    if !file_exists(&swf_path) {
        eprint!("Cannot find file: {:?}", swf_path);
        return Err("cannot find swf build".to_string());
    }

    // Linux
    // Sets the full path in Linux, due to Linux filesystem permission
    if env::consts::OS == "linux" {
        if let Ok(_) = std::fs::canonicalize(&swf_path) {
            if let Err(perm_err) = Command::new("chmod")
                .arg("+x")
                .arg(&flash_runtime_path)
                .output()
            {
                println!("Linux fix: could not run command: {:?}", perm_err);
            }
        }
    }
    println!("Opening: {:?}, {:?}", flash_runtime_path, swf_path);

    // Open the game in Flash
    let mut cmd = Command::new(&flash_runtime_path)
        .arg(&swf_path)
        .spawn()
        .map_err(|err| {
            format!(
                "[BYMR LAUNCHER] Failed to start BYMR build {}: {:?}",
                build_name, err
            )
        })?;

    // Wait for the command to complete
    cmd.wait().map_err(|err| {
        format!(
            "[BYMR LAUNCHER] Failed to wait for BYMR build {}: {:?}",
            build_name, err
        )
    })?;

    Ok(())
}

pub fn emit_event(app: &AppHandle, message: String) {
    app.emit_all(
        "infoLog",
        Payload {
            message: message.to_string(),
        },
    )
    .unwrap();
}
