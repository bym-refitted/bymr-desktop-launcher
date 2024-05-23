use crate::version_manager::{LocalVersionManifest, DOWNLOADS_FOLDER, DOWNLOAD_BASE_PATH};
use reqwest::Client;
use std::fs;
use std::io::Read;
use std::path::Path;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

pub async fn download_file(file_path: &str, url: &str, use_https: bool) -> Result<(), String> {
    let scheme = if use_https { "https" } else { "http" };
    let full_url = format!("{}://{}{}", scheme, DOWNLOAD_BASE_PATH, url);
    let client = Client::new();

    let resp = match client.get(&full_url).send().await {
        Ok(resp) => resp,
        Err(err) => return Err(format!("Failed to download file: {}", err)),
    };

    if resp.status() != reqwest::StatusCode::OK {
        return Err(format!(
            "Could not connect & download file - Status: {} {}",
            resp.status(),
            url
        ));
    }

    // Create the file
    let mut out = match File::create(file_path).await {
        Ok(file) => file,
        Err(err) => return Err(format!("Failed to create file: {}", err)),
    };

    // Write the response body to the file
    let content = match resp.bytes().await {
        Ok(bytes) => bytes,
        Err(err) => return Err(format!("Failed to read response body: {}", err)),
    };

    if let Err(err) = out.write_all(&content).await {
        return Err(format!("Failed to write to file: {}", err));
    }

    Ok(())
}

pub fn file_exists(file_path: &str) -> bool {
    fs::metadata(file_path).is_ok()
}

pub fn ensure_folder_exists(folder: &str) -> Result<(), String> {
    let path = Path::new(folder);

    if !path.exists() {
        println!("Creating {} folder", folder);
        if let Err(err) = fs::create_dir(path) {
            return Err(format!("Failed to create {} folder: {}", folder, err));
        }
    }
    Ok(())
}

pub fn get_local_versions() -> (bool, LocalVersionManifest, String) {
    let binding = Path::new(DOWNLOADS_FOLDER).join("version.json");
    let version_file_path = binding.to_str().unwrap();

    if !file_exists(version_file_path) {
        return (
            false,
            LocalVersionManifest::default(),
            "File does not exist".to_string(),
        );
    } else {
        match fs::File::open(&version_file_path) {
            Ok(mut file) => {
                let mut contents = String::new();
                if let Err(err) = file.read_to_string(&mut contents) {
                    return (
                        false,
                        LocalVersionManifest::default(),
                        format!("Failed to read version.json file: {}", err),
                    );
                }
                match serde_json::from_str::<LocalVersionManifest>(&contents) {
                    Ok(local_manifest) => (true, local_manifest, String::new()),
                    Err(err) => (
                        false,
                        LocalVersionManifest::default(),
                        format!("Failed to decode version.json file: {}", err),
                    ),
                }
            }
            Err(err) => (
                false,
                LocalVersionManifest::default(),
                format!("Failed to open version.json file: {}", err),
            ),
        }
    }
}

pub async fn set_local_versions(local_manifest: LocalVersionManifest) -> Result<(), String> {
    let version_file_path = Path::new("path/to/downloads/version.json");
    let file = match std::fs::File::create(&version_file_path) {
        Ok(file) => file,
        Err(err) => return Err(format!("Failed to create local version manifest: {}", err)),
    };

    let mut file_writer = std::io::BufWriter::new(file);
    match serde_json::to_writer_pretty(&mut file_writer, &local_manifest) {
        Ok(()) => Ok(()),
        Err(err) => Err(format!("Failed to encode local version manifest: {}", err)),
    }
}
