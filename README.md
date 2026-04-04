![launcher](https://github.com/user-attachments/assets/98d5d0d9-2774-435b-adaa-0c1b27c134ce)

<br />
<br />

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)

# Overview 🕹️

A desktop launcher for Windows, Mac & Linux which utilises the efficiency of Rust and Tauri for managing Flash runtimes and game versions, for the Backyard Monsters Refitted client. This launcher packages the required SWF binaries and loads them into Flash Player.

<br />

# MacOS 🍎
1. Manually download and install Flash from our website on [macOS](https://cdn.bymrefitted.com/runtimes/flashplayer.dmg).
2. Move the installed app to your Applications folder.
3. When running the launcher for the first time, you may need to click Open Anyway in **Settings ⟶ Privacy & Security.**

<br />

# Linux 🐧
Ubuntu/Debian:
```bash
# Install runtime dependencies
# Note: package names with the t64 suffix are Ubuntu 24.04+ only
# On Ubuntu 22.04 or older, remove the t64 suffix (e.g. libatk1.0-0, libgtk-3-0)
sudo apt update
sudo apt install -y libnss3 libatk1.0-0t64 libxss1 libgtk-3-0t64 \
  libasound2t64 libgtk2.0-0t64 libdbus-glib-1-2

# Make AppImage executable (replace the version number with the one you downloaded)
chmod +x bymr-launcher_0.3.8_amd64.AppImage

# Run the launcher
./bymr-launcher_0.3.8_amd64.AppImage
```
Fedora/RHEL/CentOS:
```bash
sudo dnf install -y nss atk libXScrnSaver gtk3 alsa-lib gtk2 dbus-glib
```

Arch/Manjaro:
```bash
sudo pacman -Sy --noconfirm nss at-spi2-atk libxss gtk3 alsa-lib gtk2 dbus-glib
```

SteamOS/Steam Deck:
```bash
# Make filesystem writable
sudo steamos-readonly disable

# Initialize pacman keys (if not already done)
sudo pacman-key --init
sudo pacman-key --populate archlinux
sudo pacman-key --populate holo

# Install dependencies
sudo pacman -Sy --noconfirm nss at-spi2-atk libxss gtk3 alsa-lib gtk2 dbus-glib
```
For additional troubleshooting steps on Linux visit our [troubleshooting page](https://github.com/bym-refitted/bymr-desktop-launcher/wiki/Linux-Troubleshooting)

<br />

# Development ⚙️

## Prerequisites

Before getting started, ensure you have the following components installed and properly configured:

| Component | Description | Installation Link |
|-----------|-------------|-------------------|
| **Rust** | The Rust programming language | [Install Rust](https://www.rust-lang.org/tools/install) |
| **Cargo** | Rust's package manager | [Cargo Registry](https://crates.io/) |
| **MSVC Toolchain** | Microsoft Visual C++ build tools | [Download MSVC](https://visualstudio.microsoft.com/vs/features/cplusplus/) |
| **Node.js & NPM** | JavaScript runtime and package manager | [Install Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) |

<br />

### MSVC Toolchain Configuration

This project requires compilation with the **MSVC toolchain** rather than the GNU alternative. The MSVC toolchain properly embeds the WebView2 runtime into the binary, while GNU requires distributing an additional `WebView2Loader.dll` file alongside your executable. For more details, see the [tauri-webview2 documentation](https://crates.io/crates/tauri-webview2#runtime).

For comprehensive setup instructions, please refer to the [Tauri Prerequisites Guide](https://v1.tauri.app/v1/guides/getting-started/prerequisites/).

<br />

## Live Development

Start the development server using either of the following commands:

```bash
npm run tauri dev
```

or

```bash
cargo tauri dev
```

This launches a Vite development server with fast hot-reload capabilities for your frontend changes. The development server is also accessible at **http://localhost:5173** if you prefer to develop directly in your browser.

<br />

## Building

### Windows

```bash
npm run tauri build -- --bundles nsis,msi
```

<br />

### macOS Universal Build

Add both Rust targets before building:

```bash
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
```

Then run the build:

```bash
sudo CI=true npm run tauri build -- --target universal-apple-darwin
```

#### Troubleshooting

1. In **Mac Settings > Privacy & Security > Full Disk Access**, ensure your terminal is toggled on
2. In **Mac Settings > Privacy & Security > Automation**, ensure Finder is switched on under Terminal
3. Run with `sudo`
4. Ensure `CI=true` is set in your environment variables

<br />

### Linux

Install the required system dependencies for your distro, then build:

```bash
# Ubuntu/Debian
sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora/RHEL
sudo dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file \
  libxdo-devel libayatana-appindicator-gtk3-devel librsvg2-devel

npm run tauri build -- --bundles deb,rpm,appimage
```

<br />

# Deployment 🚀

`release.sh` in the repo root handles versioning and triggering CI builds. Run it from the repo root with Git Bash (or any bash shell on macOS/Linux):

```bash
./release.sh          # bump patch (e.g. 0.3.7 → 0.3.8)
./release.sh minor    # bump minor (e.g. 0.3.7 → 0.4.0)
./release.sh major    # bump major (e.g. 0.3.7 → 1.0.0)
```

The script will:
1. Bump the version in `Cargo.toml` and `tauri.conf.json`
2. Commit and tag the release (e.g. `v0.3.8`)
3. Push the commit and tag to trigger GitHub Actions, which builds installers for Windows, macOS, and Linux

> Your working tree must be clean before running the script.