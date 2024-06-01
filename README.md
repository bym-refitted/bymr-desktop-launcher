![launcher](https://github.com/bym-refitted/bymr-desktop-launcher/assets/157532981/a089982e-d2da-4ccb-9950-d16bba9485a4)

<br />
<br />

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)

# Overview 🕹️

A desktop launcher for Windows, Mac & Linux which utilises the efficiency of Rust and Tauri for managing Flash runtimes and game versions, for the Backyard Monsters Refitted client. This launcher packages the required SWF binaries and loads them into Flash Player.

<br />

## Prerequisites
You will need the following components corrrectly installed and configured:
> [Rust](https://www.rust-lang.org/tools/install)

> [Cargo](https://crates.io/)

> [MSVC Toolchain](https://visualstudio.microsoft.com/vs/features/cplusplus/)

> [Node.js & NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

We need to ensure that we are compiling our application with the MSVC toolchain, as the GNU toolchain alternative does not seem to embed the WebView2 runtime into the binary and instead uses a DLL script called `WebView2Loader.dll` which would need to be packaged with your executable. You can find out more about this [here](https://crates.io/crates/tauri-webview2#runtime).

It is is recommended to locate your `.cargo` directory and modify the `config.toml` file to point to the correct linker and target. Example:
```toml
[target.x86_64-pc-windows-msvc]
linker = "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Tools\\MSVC\\14.29.30133\\bin\\HostX64\\x64\\link.exe"
ar = "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Tools\\MSVC\\14.29.30133\\bin\\HostX64\\x64\\lib.exe"
``` 

<br />

## Live Development
To run this application in development mode, use `npm run tauri dev` or if you prefer the cargo command, use `cargo tauri dev`. This will run a Vite development server that will provide very fast hot reload of your frontend changes.  There is also a dev server that runs on http://localhost:5173 if you want to develop in a browser.

<br />

## Production Build
To build a redistributable, production mode package, use `npm run tauri build --release` or `cargo tauri build --release`.
