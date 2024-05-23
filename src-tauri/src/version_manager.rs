use crate::file_manager::{download_file, ensure_folder_exists, file_exists, get_local_versions};
use reqwest;
use serde::{Deserialize, Serialize};
use std::path::Path;

pub const VERSION_INFO_PATH_BASE: &str = "api.bymrefitted.com/launcher.json";
pub const DOWNLOAD_BASE_PATH: &str = "api.bymrefitted.com/launcher/downloads/";
pub const DOWNLOADS_FOLDER: &str = "bymr-downloads";
pub const BUILD_FOLDER: &str = "bymr-downloads/swfs";
pub const RUNTIME_FOLDER: &str = "bymr-downloads/runtimes";

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct LocalVersionManifest {
    pub current_game_version: String,
    pub current_launcher_version: String,
    pub builds: Builds,
    pub flash_runtimes: FlashRuntimes,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct VersionManifest {
    pub current_game_version: String,
    pub current_launcher_version: String,
    pub builds: Builds,
    pub flash_runtimes: FlashRuntimes,
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

pub async fn get_version_info() -> Result<VersionManifest, String> {
    let mut https_worked = false;

    // First we try https
    let resp = match reqwest::get(&format!("https://{}", VERSION_INFO_PATH_BASE)).await {
        Ok(resp) => {
            println!("Launcher successfully connected over https");
            https_worked = true;
            resp
        }
        Err(err) => {
            // try via http if that fails
            eprintln!("Could not access over https, attempting http: {}", err);
            match reqwest::get(&format!("http://{}", VERSION_INFO_PATH_BASE)).await {
                Ok(resp) => resp,
                Err(err) => {
                    eprintln!("Could not access over http, please check the server status on our discord: {}", err);
                    return Err(err.to_string());
                }
            }
        }
    };
    
    let mut data: VersionManifest = resp.json().await.map_err(|err| err.to_string())?;
    data.https_worked = https_worked;
    Ok(data)
}

pub fn local_files_status() -> (bool, LocalVersionManifest, String) {
    let _ = ensure_folder_exists(DOWNLOADS_FOLDER);
    let _ = ensure_folder_exists(BUILD_FOLDER);
    let _ = ensure_folder_exists(RUNTIME_FOLDER);

    return get_local_versions();
}

pub async fn download_swfs(builds: &Builds, version: &str, use_https: bool) -> Result<(), String> {
    let builds_to_check = [
        (&builds.stable, "stable"),
        (&builds.http, "http"),
        (&builds.local, "local"),
    ];

    for (build_url, build_name) in &builds_to_check {
        let build_path = format!("{}/bymr-{}-{}.swf", BUILD_FOLDER, build_name, version);
        if let Err(err) = download_file(&build_path, build_url, use_https).await {
            return Err(err);
        }
    }

    Ok(())
}

pub fn do_all_swfs_exist(builds: &Builds, version: &str) -> bool {
    let builds_to_check = [
        (&builds.stable, "stable"),
        (&builds.http, "http"),
        (&builds.local, "local"),
    ];

    for (_, build_name) in &builds_to_check {
        let binding = Path::new(BUILD_FOLDER).join(format!("bymr-{}-{}.swf", build_name, version));
        let file_path = binding.to_str().unwrap();

        if !file_exists(file_path) {
            return false;
        }
    }
    true
}

pub async fn download_runtimes(
    flash_runtime_file_name: &str,
    use_https: bool,
) -> Result<(), String> {
    let flash_file_path = format!("{}/{}", RUNTIME_FOLDER, flash_runtime_file_name);
    download_file(&flash_file_path, flash_runtime_file_name, use_https).await
}

pub fn get_platform_flash_runtime(
    platform: &str,
    server_manifest: &VersionManifest,
) -> Result<String, String> {
    match platform {
        "windows" => Ok(server_manifest.flash_runtimes.windows.clone()),
        "darwin" => Ok(server_manifest.flash_runtimes.darwin.clone()),
        "linux" => Ok(server_manifest.flash_runtimes.linux.clone()),
        _ => Err(format!("unsupported platform: {}", platform)),
    }
}
