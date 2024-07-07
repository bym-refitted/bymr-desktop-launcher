use std::path::PathBuf;

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use serde::{Deserialize, Serialize};

pub const VERSION_INFO_PATH_BASE: &str = "api.bymrefitted.com/launcher.json";
pub const DOWNLOAD_BASE_PATH: &str = "cdn.bymrefitted.com/launcher/downloads/";

pub const RUNTIME_FOLDER: &str = "bymr-downloads/runtimes";
#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct VersionManifest {
    #[serde(rename = "currentGameVersion")]
    pub current_game_version: String,
    #[serde(rename = "currentLauncherVersion")]
    pub current_launcher_version: String,
    pub builds: Builds,
    #[serde(rename = "flashRuntimes")]
    pub flash_runtimes: FlashRuntimes,
    #[serde(rename = "httpsWorked")]
    pub https_worked: bool,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct Builds {
    stable: String,
    http: String,
    local: String,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct FlashRuntimes {
    windows: String,
    darwin: String,
    linux: String,
}

pub async fn get_server_manifest() -> Result<VersionManifest, networking::FetchError> {
    fetch_json_with_http_retry(VERSION_INFO_PATH_BASE)
        .await
        .map(|value: (VersionManifest, bool)| {
            let (mut manifest, https_worked) = value;
            manifest.https_worked = https_worked;
            manifest
        })
}

pub async fn download_runtime(
    (runtime_path, file_extension): (PathBuf, String),
    use_https: bool,
) -> Result<(), String> {
    // let flash_file_path = format!("{}/{}", RUNTIME_FOLDER, flash_runtime_file_name);
    download_file(&runtime_path, &file_extension, use_https)
        .await
        .map_err(|err| err.to_string())
}

pub fn get_platform_flash_runtime(platform: &str) -> Result<(PathBuf, String), String> {
    let runtime = match platform {
        "windows" => Ok("flashplayer.exe".to_string()),
        "darwin" => Ok("flashplayer.dmg".to_string()),
        "linux" => Ok("flashplayer".to_string()),
        _ => Err(format!("unsupported platform: {}", platform)),
    };

    runtime.map(|file_name| {
        (
            PathBuf::from(RUNTIME_FOLDER).join(file_name.clone()),
            file_name,
        )
    })
}
