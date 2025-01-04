use std::path::PathBuf;

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

pub const VERSION_MANIFEST_URL: &str = "cdn.bymrefitted.com/versionManifest.json";
pub const SWFS_URL: &str = "cdn.bymrefitted.com/launcher/swfs/";

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

pub async fn download_runtime(
    runtime_path: PathBuf, 
    runtime_executable: String,
    use_https: bool,
) -> Result<(), String> {
    download_file(&runtime_path, &runtime_executable, use_https)
        .await
        .map_err(|err| err.to_string())
}

pub fn get_platform_flash_runtime(platform: &str, appdata_path: PathBuf) -> Result<(PathBuf, String), String> {
    let flash_runtimes = match platform {
        "windows" => Ok("flashplayer.exe".to_string()),
        "darwin" => Ok("flashplayer.dmg".to_string()),
        "linux" => Ok("flashplayer".to_string()),
        _ => Err(format!("unsupported platform: {}", platform)),
    };

    flash_runtimes.map(|runtime| (appdata_path.join(runtime.clone()), runtime))
}

pub fn get_appdata_path(app_handle: &AppHandle) -> PathBuf {
    return app_handle.path_resolver().app_data_dir().unwrap();
}
