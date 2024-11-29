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
    let mounted_volume;
    if let Some(matching_volume_capture) = regex.captures(&hdiutil_output_string) {
        mounted_volume = matching_volume_capture.get(0).unwrap().as_str().trim();
    }
    else {
        return Err("Mount command returned no path to the volume".to_string());
    }

    // Copy runtime executable from volume to runtime folder
    let volume_read_result = fs::read_dir(mounted_volume)
        .map_err(|err| err.to_string())?;

    let volume_apps: Vec<_> = volume_read_result
        .filter_map(|file_entry| {
            let file_entry = file_entry.ok()?;
            let file_path = file_entry.path();
            if !file_path.is_file() && file_path.extension()?.eq("app") {
                Some(file_path)
            }
            else {
                None
            }
        })
        .collect();

    // Ensure only one .app is contained
    let app_file_count = volume_apps.len();
    if app_file_count != 1 {
        return Err(format!(
            "Unexpected number of app files within volume: {}, expected 1, contained files: {:?}",
            app_file_count,
            volume_apps,
        ));
    }

    // Copy the only .app folder to runtime folder using system copy command
    let source_app_folder = volume_apps.first().unwrap();
    let dest_folder = format!("{}/", RUNTIMES_DIR);
    let copy_process = Command::new("cp")
        .arg("-rf")
        .arg(source_app_folder)
        .arg(&dest_folder)
        .output()
        .map_err(|err| err.to_string())?;

    if !copy_process.status.success() {
        return Err(format!(
            "Copying .app from: {:?} to {}, error: {}",
            source_app_folder,
            dest_folder,
            String::from_utf8_lossy(&hdiutil_process.stderr),
        ));
    }

    // Finally check if the executable path is now available
    if !executable_path.exists() {
        return Err(format!(
            "After extraction, the expected executable path is still not available: {:?}",
            executable_path,
        ));
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