use std::{
    fs,
    path::{Path, PathBuf},
};

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use serde::{Deserialize, Serialize};

pub const VERSION_MANIFEST_URL: &str = "cdn.bymrefitted.com/versionManifest.json";
pub const LAUNCHER_DOWNLOADS_URL: &str = "localhost:3001/downloads/"; // TODO: Change to actual URL
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

#[tauri::command]
pub async fn get_current_game_version() -> Result<String, String> {
    match get_server_manifest().await {
        Ok(manifest) => Ok(manifest.current_game_version),
        Err(err) => Err(err.to_string()),
    }
}

fn ensure_folder_exists(runtime_path: &Path) -> std::io::Result<()> {
    if !runtime_path.exists() {
        fs::create_dir_all(runtime_path)?;
    }
    Ok(())
}

pub async fn download_runtime(
    (runtime_path, file_extension): (PathBuf, String),
    use_https: bool,
) -> Result<(), String> {
    ensure_folder_exists(Path::new(RUNTIMES_DIR)).expect("Could not create runtimes folder");

    download_file(&runtime_path, &file_extension, use_https)
        .await
        .map_err(|err| err.to_string())
}

pub fn get_platform_flash_runtime(platform: &str) -> Result<(PathBuf, String), String> {
    let flash_runtimes = match platform {
        "windows" => Ok("flashplayer.exe".to_string()),
        "darwin" => Ok("flashplayer.dmg".to_string()),
        "linux" => Ok("flashplayer".to_string()),
        _ => Err(format!("unsupported platform: {}", platform)),
    };

    flash_runtimes.map(|runtime| (PathBuf::from(RUNTIMES_DIR).join(runtime.clone()), runtime))
}