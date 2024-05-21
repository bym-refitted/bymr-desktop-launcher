use crate::version_manager::{LocalVersionManifest, DOWNLOADS_FOLDER};
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::Path;

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

pub fn file_exists(file_path: &str) -> bool {
    fs::metadata(file_path).is_ok()
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
        match File::open(&version_file_path) {
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
