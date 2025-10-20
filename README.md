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

# macOS 🍎

1. **Open the DMG file** `bymr-launcher_x.x.x_universal.dmg`
2. **Drag and drop** `bymr-launcher.app` into the **Applications** folder
3. **Navigate to Applications** and locate `bymr-launcher`
4. **Right-click** on `bymr-launcher` and select **Open**
5. A warning will appear about the app being from an unidentified developer
6. Click **Done** on the warning dialog
7. Open **System Settings**
8. Go to **Privacy & Security**
9. Scroll down to the bottom **Security** section
10. You should see a message: *"bymr-launcher" was blocked to protect your Mac.* Click **Open Anyway**
11. Click **Open Anyway** again when prompted to confirm
12. The launcher should now open successfully

**Note:** This is required because the app is not signed with an Apple Developer certificate. You only need to do this once.

<br />

# Linux 🐧
Ubuntu/Debian:
```bash
# Install dependencies
# NOTE: version 0.3.5 is just a hardcoded example, use the actual version you have
sudo apt update

sudo apt install -y libnss3 libatk1.0-0t64 libxss1 libgtk-3-0t64 \
libasound2t64 libgtk2.0-0t64 libdbus-glib-1-2

# Make AppImage executable
chmod +x bymr-launcher_0.3.5_amd64.AppImage

# Run the launcher
./bymr-launcher_0.3.5_amd64.AppImage
```
Fedora/RHEL/CentOS:
```bash
sudo dnf install -y nss atk libXScrnSaver gtk3 alsa-lib gtk2 dbus-glib
```

Arch/Manjaro:
```bash
sudo pacman -Sy --noconfirm nss at-spi2-atk libxscrnsaver gtk3 alsa-lib gtk2 dbus-glib
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
sudo pacman -Sy --noconfirm nss at-spi2-atk libxscrnsaver gtk3 alsa-lib gtk2 dbus-glib
```

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
