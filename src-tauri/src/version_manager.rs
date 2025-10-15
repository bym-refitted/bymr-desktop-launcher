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

    let final_runtime_path = if env::consts::OS == "linux" || env::consts::OS == "macos" {
        runtimes_dir.join(&runtime_path)
    } else {
        runtime_path.clone()
    };

    // Special handling for macOS Flash Player DMG
    if cfg!(target_os = "macos") && file_extension == "flashplayer.dmg" {
        download_and_extract_macos_flashplayer(&runtimes_dir, &file_extension, use_https).await?;
    } else {
        download_file(&final_runtime_path, &file_extension, use_https)
            .await
            .map_err(|err| err.to_string())?;

        // Unix-like systems (Linux and macOS) - make the file executable
        if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            let path_str = final_runtime_path.to_string_lossy();
            let output = Command::new("chmod")
                .arg("-R")
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
    }

    Ok(())
}

pub fn get_platform_flash_runtime(
    app_handle: &AppHandle,
    platform: &str,
) -> Result<(PathBuf, String), String> {
    let (runtime_name, download_file) = match platform {
        "windows" => ("flashplayer.exe".to_string(), "flashplayer.exe".to_string()),
        "macos" => ("Flash Player.app".to_string(), "flashplayer.dmg".to_string()), // Use the .app bundle
        "linux" => ("flashplayer".to_string(), "flashplayer".to_string()),
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
    
    Ok((runtimes_dir.join(&runtime_name), download_file))
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
    let app_path = runtimes_dir.join("Flash Player.app");

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
    println!("Mount output: {}", mount_info); // Debug output
    
    let mount_point = mount_info
        .lines()
        .filter_map(|line| {
            // Look for lines that contain /Volumes/
            if line.contains("/Volumes/") {
                // Find the position where /Volumes/ starts
                if let Some(start_pos) = line.find("/Volumes/") {
                    // Extract everything from /Volumes/ to the end of the line
                    let volume_path = line[start_pos..].trim();
                    Some(volume_path.to_string())
                } else {
                    None
                }
            } else {
                None
            }
        })
        .next()
        .ok_or("Could not find mount point")?;

    // Copy Flash Player.app from the mounted DMG
    // First, let's see what's actually in the mounted volume
    let ls_output = Command::new("ls")
        .arg("-la")
        .arg(&mount_point)
        .output()
        .map_err(|err| format!("Failed to list DMG contents: {}", err))?;

    if ls_output.status.success() {
        println!("DMG contents: {}", String::from_utf8_lossy(&ls_output.stdout));
    }

    // Try the expected path first: Flash Player.app directly in the mount point
    let expected_app = format!("{}/Flash Player.app", mount_point);
    let source_app = if std::path::Path::new(&expected_app).exists() {
        expected_app
    } else {
        // Fallback: search for any .app bundle
        let find_output = Command::new("find")
            .arg(&mount_point)
            .arg("-name")
            .arg("*.app")
            .arg("-type")
            .arg("d")
            .output()
            .map_err(|err| format!("Failed to find .app bundle: {}", err))?;

        if !find_output.status.success() {
            return Err(format!(
                "Failed to find .app bundle: {}",
                String::from_utf8_lossy(&find_output.stderr)
            ));
        }

        let app_paths = String::from_utf8_lossy(&find_output.stdout);
        app_paths
            .lines()
            .next()
            .ok_or("No .app bundle found in DMG")?
            .trim()
            .to_string()
    };

    println!("Found app at: {}", source_app);

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
    let unmount_output = Command::new("hdiutil")
        .arg("detach")
        .arg(mount_point)
        .arg("-quiet")
        .output()
        .map_err(|err| format!("Failed to unmount DMG: {}", err))?;

    if !unmount_output.status.success() {
        eprintln!(
            "Warning: Failed to unmount DMG: {}",
            String::from_utf8_lossy(&unmount_output.stderr)
        );
    }

    // Make Flash Player.app executable
    let chmod_output = Command::new("chmod")
        .arg("-R")
        .arg("+x")
        .arg(&app_path)
        .output()
        .map_err(|err| format!("Failed to execute chmod: {}", err))?;

    if !chmod_output.status.success() {
        return Err(format!(
            "chmod failed: {}",
            String::from_utf8_lossy(&chmod_output.stderr)
        ));
    }

    // Also specifically make the executable inside the app bundle executable
    let app_name = app_path.file_stem().unwrap().to_string_lossy();
    let executable_path = app_path.join("Contents/MacOS").join(app_name.as_ref());
    
    if executable_path.exists() {
        let chmod_exec_output = Command::new("chmod")
            .arg("+x")
            .arg(&executable_path)
            .output()
            .map_err(|err| format!("Failed to chmod executable: {}", err))?;

        if !chmod_exec_output.status.success() {
            eprintln!(
                "Warning: Failed to chmod executable: {}",
                String::from_utf8_lossy(&chmod_exec_output.stderr)
            );
        }
    }

    // Remove quarantine attribute which might prevent execution
    let xattr_output = Command::new("xattr")
        .arg("-dr")
        .arg("com.apple.quarantine")
        .arg(&app_path)
        .output();

    match xattr_output {
        Ok(output) if !output.status.success() => {
            // This is expected if the quarantine attribute doesn't exist
            println!("Note: No quarantine attribute to remove (this is normal)");
        }
        Err(err) => {
            eprintln!("Warning: Failed to remove quarantine attribute: {}", err);
        }
        _ => {
            println!("Successfully removed quarantine attribute");
        }
    }

    // Clean up the DMG file
    if let Err(err) = fs::remove_file(&dmg_path) {
        eprintln!("Warning: Failed to remove DMG file: {}", err);
    }

    Ok(())
}
