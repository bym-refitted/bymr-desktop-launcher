use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

use crate::networking::{self, download_file, fetch_json_with_http_retry};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

pub const VERSION_MANIFEST_URL: &str = "cdn.bymrefitted.com/versionManifest.json";
pub const SWFS_URL: &str = "cdn.bymrefitted.com/swfs/";
pub const RUNTIMES_URL: &str = "cdn.bymrefitted.com/runtimes/";

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
    // Resolve the correct directory for Linux/macOS (app data dir) or use default for others
    let runtimes_dir = if env::consts::OS == "linux" || env::consts::OS == "macos" {
        let app_data_dir = app_handle.path().app_data_dir().unwrap();
        app_data_dir.join(RUNTIMES_DIR)
    } else {
        PathBuf::from(RUNTIMES_DIR)
    };

    ensure_folder_exists(&runtimes_dir).expect("Could not create runtimes folder");

    // Download Flash runtime; Special handling for macOS Flash Player DMG
    if cfg!(target_os = "macos") && file_extension == "flashplayer.dmg" {
        download_and_extract_macos_flashplayer(&runtimes_dir, &file_extension, use_https).await?;
    } else {
        download_file(&runtime_path, &file_extension, use_https)
            .await
            .map_err(|err| err.to_string())?;
    }

    // Unix-like systems (Linux and macOS) chmod to make the file executable
    if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
        let path_str = runtime_path.to_string_lossy();
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

pub fn get_platform_flash_runtime(
    app_handle: &AppHandle,
    platform: &str,
) -> Result<(PathBuf, String), String> {
    let (runtime_name, download_file) = match platform {
        "windows" => ("flashplayer.exe", "flashplayer.exe"),
        "macos" => ("Flash Player.app/Contents/MacOS/Flash Player", "flashplayer.dmg"),
        "linux" => ("flashplayer", "flashplayer"),
        _ => return Err(format!("unsupported platform: {}", platform)),
    };

    let runtimes_dir = if platform == "linux" || platform == "macos" {
        app_handle
            .path()
            .app_data_dir()
            .unwrap()
            .join(RUNTIMES_DIR)
    } else {
        PathBuf::from(RUNTIMES_DIR)
    };
    
    Ok((runtimes_dir.join(runtime_name), download_file.to_string()))
}

fn ensure_folder_exists(runtime_path: &Path) -> std::io::Result<()> {
    if !runtime_path.exists() {
        fs::create_dir_all(runtime_path)?;
    }
    Ok(())
}

async fn download_and_extract_macos_flashplayer(
    runtimes_dir: &PathBuf,
    file_extension: &str,
    use_https: bool,
) -> Result<(), String> {
    let dmg_path = runtimes_dir.join("flashplayer.dmg");

    // Download the DMG file
    download_file(&dmg_path, file_extension, use_https)
        .await
        .map_err(|err| err.to_string())?;

    // Mount the DMG
    let mount_output = Command::new("hdiutil")
        .arg("attach")
        .arg(&dmg_path)
        .arg("-nobrowse")
        .output()
        .map_err(|err| format!("Failed to mount DMG: {}", err))?;

    if !mount_output.status.success() {
        return Err(format!(
            "Failed to mount DMG: {}",
            String::from_utf8_lossy(&mount_output.stderr)
        ));
    }

    // Parse mount output to find the mount point
    let mount_info = String::from_utf8_lossy(&mount_output.stdout);
    let mount_point = mount_info
        .lines()
        .find_map(|line| {
            if line.contains("/Volumes/") {
                line.find("/Volumes/").map(|start| line[start..].trim())
            } else {
                None
            }
        })
        .ok_or("Could not find mount point")?;

    // Copy Flash Player.app from the mounted DMG
    let source_app = format!("{}/Flash Player.app", mount_point);
    let copy_output = Command::new("cp")
        .arg("-R")
        .arg(&source_app)
        .arg(&runtimes_dir)
        .output()
        .map_err(|err| format!("Failed to copy Flash Player.app: {}", err))?;

    if !copy_output.status.success() {
        return Err(format!(
            "Failed to copy Flash Player.app: {}",
            String::from_utf8_lossy(&copy_output.stderr)
        ));
    }

    // Unmount the DMG
    let _unmount_dmg = Command::new("hdiutil")
        .arg("detach")
        .arg(mount_point)
        .arg("-quiet")
        .output();

    // Remove quarantine attribute to prevent macOS from blocking execution
    let app_path = runtimes_dir.join("Flash Player.app");
    let _xattr_fix = Command::new("xattr")
        .arg("-dr")
        .arg("com.apple.quarantine")
        .arg(&app_path)
        .output();

    // Clean up the DMG file
    let _cleanup_dmg = fs::remove_file(&dmg_path);

    Ok(())
}
