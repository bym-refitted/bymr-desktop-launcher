//! # Networking Module
//!
//! This module provides utilities for performing network requests and handling responses.
//! It defines a custom `FetchError` enum to categorize the types of errors that can occur during
//! a network request. Additionally, it includes implementations for converting from `reqwest::Error`
//! and `serde_json::Error` into `FetchError`, allowing for a unified error handling interface.
//!
//! ## Features
//!
//! - Asynchronous network requests using the `reqwest` crate.
//! - Custom error handling with detailed error messages.
//! - Conversion traits for seamless error handling across different error types.
//!
//!
//! Note: This module is designed to be used by other parts of the application that require network communication.
//! It abstracts away some of the complexities of error handling and request making.

use std::{fmt, path::PathBuf};
use tokio::{fs::File, io::AsyncWriteExt};

use crate::SWFS_URL;

#[derive(Debug)]
pub(crate) enum FetchError {
    Http(String),
    InvalidStatusCode(u16), // Stores the status code
    DecodeError(serde_json::Error),
    IoError(std::io::Error),
}

impl From<reqwest::Error> for FetchError {
    fn from(error: reqwest::Error) -> Self {
        if let Some(status) = error.status() {
            // If the error is due to an HTTP status, we use the InvalidStatusCode variant
            FetchError::InvalidStatusCode(status.as_u16())
        } else if error.is_timeout() {
            FetchError::Http("Request timed out".to_string())
        } else {
            FetchError::Http(error.to_string())
        }
    }
}

impl From<serde_json::Error> for FetchError {
    fn from(error: serde_json::Error) -> Self {
        FetchError::DecodeError(error)
    }
}

impl From<std::io::Error> for FetchError {
    fn from(err: std::io::Error) -> Self {
        FetchError::IoError(err)
    }
}

impl fmt::Display for FetchError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FetchError::Http(err) => write!(f, "The server could not be reached. Please check your internet connection & the uptime channel on discord. \n {}", err.to_string()),
            FetchError::InvalidStatusCode(status) => write!(f, "Could not get server manifest. Failed with status code: {}", status),
            FetchError::DecodeError(err) => write!(f, "The server manifest could not be decoded, there may be an issue with the server or you may need to update your launcher \n Decode Error:  {}", err),
            FetchError::IoError(err) => write!(f, "I/O error writing file or folder. \n IO Error:  {}", err),
        }
    }
}

async fn make_request(
    protocol: &str,
    url_base_path: &str,
) -> Result<reqwest::Response, FetchError> {
    let url = format!("{}://{}", protocol, url_base_path);
    let result: Result<reqwest::Response, FetchError> =
        reqwest::get(&url).await.map_err(|e| e.into());

    match result {
        Ok(response) if response.status().is_success() => Ok(response),
        Ok(response) => Err(FetchError::InvalidStatusCode(response.status().as_u16())),
        Err(e) => Err(e.into()),
    }
}

pub async fn fetch_with_http_retry(
    url_base_path: &str,
) -> Result<(reqwest::Response, bool), FetchError> {
    for &protocol in &["https", "http"] {
        match make_request(protocol, url_base_path).await {
            Ok(response) => return Ok((response, protocol == "https")),
            Err(_) if protocol == "https" => continue, // Retry with HTTP if HTTPS fails
            Err(e) => return Err(e),
        }
    }
    // This realistically should never be reached
    // But the compiler doesn't know that because its a bastard that doesn't know the size of the protocol vector so we use the teapot status code. If you see this error in the logs, I am braindead
    println!("No protocols defined, something went horribly wrong");
    Err(FetchError::InvalidStatusCode(418))
}

/// Fetches and decodes JSON data from a specified URL with automatic retry for HTTPS to HTTP fallback.
///
/// This function attempts to fetch JSON data from a given URL, automatically retrying with HTTP if HTTPS fails.
/// It deserializes the JSON response into the specified type `JsonType`.
///
/// # Arguments
/// * `url_base_path` - A string slice that holds the base path of the URL to fetch the data from.
///
/// # Returns
/// A `Result` containing either:
/// - On success: A tuple of the deserialized data of type `T` and a boolean indicating whether HTTPS was used (`true` if so, `false` otherwise).
/// - On failure: A `FetchError` indicating the type of error that occurred during the fetch operation. This error can be converted to a string to display a user-friendly error message.
pub async fn fetch_json_with_http_retry<JsonType>(
    url_base_path: &str,
) -> Result<(JsonType, bool), FetchError>
where
    JsonType: serde::de::DeserializeOwned,
{
    println!("Fetching manifest");
    let (response, https_worked) = fetch_with_http_retry(url_base_path).await?;
    let body = response.text().await?;
    println!("Decoding manifest");
    let data: Result<JsonType, _> = serde_json::from_str(&body);
    // Convert a working request to a tuple, and a failed request to a decode error
    data.map(|value| (value, https_worked))
        .map_err(|e| FetchError::DecodeError(e))
}

fn get_protocol(use_https: bool) -> &'static str {
    if use_https {
        "https"
    } else {
        "http"
    }
}

pub async fn download_file(
    file_path: &PathBuf,
    web_path: &str,
    use_https: bool,
) -> Result<(), FetchError> {
    println!("download_file:: runtime_path and file_extension turned into: file_path={:?}, url={:?}", file_path, web_path);
    let full_url = format!(
        "{}://{}{}",
        get_protocol(use_https),
        SWFS_URL,
        web_path
    );
    println!("Full download url: {:?}", full_url);
    let mut response = reqwest::Client::new().get(&full_url).send().await?;
    // Exit early on bad code
    if !response.status().is_success() {
        return Err(FetchError::InvalidStatusCode(response.status().as_u16()));
    }
    println!("Downloading to path: {:?}", file_path);
    let mut out = File::create(file_path).await?;
    while let Some(chunk) = response.chunk().await? {
        out.write_all(chunk.as_ref()).await?;
    }
    println!("Download okay");
    Ok(())
}
