use std::{
    fs,
    path::PathBuf,
    process::Command,
};
use regex::Regex;

use crate::RUNTIMES_DIR;

pub fn potentially_extract_runtime(
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