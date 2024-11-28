use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use serde::{Deserialize, Serialize};
use regex::Regex;

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
    (executable_path, package_path, package_file_name): (PathBuf, PathBuf, String),
    platform: &str,
    use_https: bool,
) -> Result<(), String> {
    ensure_folder_exists(Path::new(RUNTIMES_DIR)).expect("Could not create runtimes folder");

    download_file(&package_path, &package_file_name, use_https)
        .await
        .map_err(|err| err.to_string())?;

    potentially_extract_runtime(executable_path, package_path, platform)
}

fn potentially_extract_runtime(
    executable_path: PathBuf,
    package_path: PathBuf,
    platform: &str,
) -> Result<(), String> {
    if executable_path == package_path {
        // Nothing to do
        return Ok(());
    }
    match platform {
        "darwin" | "macos" => extract_runtime_macos(executable_path, package_path),
        _ => Err("Runtime extraction not supported on this platform".to_string())
    }
}

// TODO
fn extract_runtime_macos(
    executable_path: PathBuf,
    package_path: PathBuf,
) -> Result<(), String> {
    let hdiutil_process = Command::new("hdiutil")
        .arg("attach")
        .arg("-nobrowse")
        .arg(package_path)
        .output()
        .map_err(|err| err.to_string())?;

    if !hdiutil_process.status.success() {
        return Err(format!(
            "Mounting .dmg failed: {}",
            String::from_utf8_lossy(&hdiutil_process.stderr)
        ));
    }
    
    // Extract path to mounted volume from process output
    let regex = Regex::new(r"(/Volumes/[\w\s]+)").unwrap();
    let hdiutil_output_string = String::from_utf8_lossy(&hdiutil_process.stdout);
    if let Some(matching_volume_capture) = regex.captures(&hdiutil_output_string) {
        let matching_volume = matching_volume_capture.get(0).unwrap().as_str();
        println!("Newly mounted volume: {}", matching_volume);
    }
    else {
        return Err("Mount command returned no path to the volume".to_string());
    }
    
    Ok(())
}

/// Returns path to runtime executable, path to runtime package, file name of runtime package
pub fn get_platform_flash_runtime(platform: &str) -> Result<(PathBuf, PathBuf, String), String> {
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

    flash_runtime_executable_and_package.map(|executable_and_package| {
        let runtime_executable = executable_and_package.0;
        if let Some(runtime_package) = executable_and_package.1 {
            // The runtime executable and package differ: there is an additional extraction step necessary
            (
                PathBuf::from(RUNTIMES_DIR).join(runtime_executable.clone()),
                PathBuf::from(RUNTIMES_DIR).join(runtime_package.clone()),
                runtime_package,
            )
        }
        else {
            // The runtime executable is the same as the package
            let runtime_path = PathBuf::from(RUNTIMES_DIR).join(runtime_executable.clone());
            (runtime_path.clone(), runtime_path, runtime_executable)
        }
    })
}