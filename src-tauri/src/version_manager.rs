use std::{
    fs,
    path::{Path, PathBuf},
};

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use crate::runtime_extraction::potentially_extract_runtime;
use serde::{Deserialize, Serialize};

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

pub async fn download_and_extract_runtime(
    (executable_path, package_path, package_file_name): (PathBuf, Option<PathBuf>, String),
    platform: &str,
    use_https: bool,
) -> Result<(), String> {
    ensure_folder_exists(Path::new(RUNTIMES_DIR)).expect("Could not create runtimes folder");

    // If there is a package path, download to that path. If not, fallback to the executable path
    let file_path = package_path.clone().unwrap_or(executable_path.clone());
    println!("Package path: {:?}", package_path);
    println!("Executable path: {:?}", executable_path);
    println!("Download to path: {:?}", file_path);
    println!("Package file name: {:?}", package_file_name);

    download_file(&file_path, &package_file_name, use_https)
        .await
        .map_err(|err| err.to_string())?;

    if let Some(package_path) = package_path {
        potentially_extract_runtime(executable_path, package_path, platform)
    }
    else {
        // As there is no package path, definitely no extraction step is necessary
        Ok(())
    }
}

/// Returns path to runtime executable, path to runtime package, file name of runtime package
pub fn get_platform_flash_runtime(platform: &str) -> Result<(PathBuf, Option<PathBuf>, String), String> {
    // If the package (second value) is None, it is the same as the executable (first value)
    let flash_runtime_executable_and_package = match platform {
        "windows" => Ok(("flashplayer.exe".to_string(), None)),
        "darwin" | "macos" => Ok((
            "Flash Player.app/Contents/MacOS/Flash Player".to_string(),
            Some("flashplayer.dmg".to_string())
        )),
        "linux" => Ok(("flashplayer".to_string(), None)),
        _ => Err(format!("unsupported platform: {}", platform)),
    };

    fn get_runtime_dir_path_buf(path_str: &str) -> PathBuf {
        PathBuf::from(RUNTIMES_DIR).join(path_str)
    }

    flash_runtime_executable_and_package.map(|executable_and_package| {
        // Convert all path strings to runtime directory PathBufs
        let executable = executable_and_package.0.clone();
        let executable_pathbuf = get_runtime_dir_path_buf(&executable);
        // If the runtime package is None, leave it untouched
        let package = executable_and_package.1;
        let package_pathbuf = package.clone().map(|path_str| get_runtime_dir_path_buf(&path_str));
        (executable_pathbuf, package_pathbuf, package.unwrap_or(executable))
    })
}