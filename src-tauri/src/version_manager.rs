use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

pub const VERSION_MANIFEST_URL: &str = "cdn.bymrefitted.com/versionManifest.json";
pub const SWFS_URL: &str = "cdn.bymrefitted.com/launcher/swfs/";
pub const RUNTIMES_DIR: &str = "bymr-downloads/runtimes";

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct VersionManifest {
    #[serde(rename = "currentGameVersion")]
    pub current_game_version: String,
    #[serde(rename = "currentLauncherVersion")]
    pub current_launcher_version: String,
    #[serde(rename = "httpsWorked")]
    pub https_worked: bool,
}

pub async fn get_server_manifest() -> Result<VersionManifest, networking::FetchError> {
    fetch_json_with_http_retry(VERSION_MANIFEST_URL)
        .await
        .map(|value: (VersionManifest, bool)| {
            let (mut manifest, https_worked) = value;
            manifest.https_worked = https_worked;
            manifest
        })
}

pub async fn download_runtime(
    app_handle: &AppHandle,
    (runtime_path, file_extension): (PathBuf, String),
    use_https: bool,
) -> Result<(), String> {
    // Resolve the correct directory for Linux (app data dir) or use default for others
    let runtimes_dir = if env::consts::OS == "linux" {
        let app_data_dir = app_handle.path_resolver().app_data_dir().unwrap();
        app_data_dir.join(RUNTIMES_DIR)
    } else {
        PathBuf::from(RUNTIMES_DIR)
    };

    ensure_folder_exists(&runtimes_dir).expect("Could not create runtimes folder");

    let final_runtime_path = if env::consts::OS == "linux" {
        runtimes_dir.join(&runtime_path)
    } else {
        runtime_path.clone()
    };

    download_file(&final_runtime_path, &file_extension, use_https)
        .await
        .map_err(|err| err.to_string())?;

    // Linux-specific chmod to make the file executable
    if cfg!(target_os = "linux") {
        let path_str = final_runtime_path.to_string_lossy();
        let output = Command::new("chmod")
            .arg("+x")
            .arg(path_str.as_ref())
            .output()
            .map_err(|err| format!("Failed to execute chmod: {}", err))?;

        if !output.status.success() {
            return Err(format!(
                "chmod failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }

    Ok(())
}

pub fn get_platform_flash_runtime(app_handle: &AppHandle, platform: &str,) -> Result<(PathBuf, String), String> {
    let flash_runtimes = match platform {
        "windows" => Ok("flashplayer.exe".to_string()),
        "darwin" => Ok("flashplayer.dmg".to_string()),
        "linux" => Ok("flashplayer".to_string()),
        _ => Err(format!("unsupported platform: {}", platform)),
    };

    flash_runtimes.map(|runtime| {
        let runtimes_dir = if platform == "linux" {
            app_handle
                .path_resolver()
                .app_data_dir()
                .unwrap()
                .join(RUNTIMES_DIR)
        } else {
            PathBuf::from(RUNTIMES_DIR)
        };
        (runtimes_dir.join(&runtime), runtime)
    })
}

fn ensure_folder_exists(runtime_path: &Path) -> std::io::Result<()> {
    if !runtime_path.exists() {
        fs::create_dir_all(runtime_path)?;
    }
    Ok(())
}