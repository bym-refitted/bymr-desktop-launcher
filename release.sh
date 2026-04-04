#!/usr/bin/env bash

# ================================================================ #
# BYMR Launcher release tool                                       #
#                                                                  #
# Bumps the version in Cargo.toml and tauri.conf.json, commits,    #
# tags, and pushes — triggering GitHub Actions to build            #
# installers for all platforms (Windows, macOS, Linux).            #
#                                                                  #
# Usage (run from the repo root):                                  #
#                                                                  #
#   ./release.sh          # bump patch  (e.g. 0.3.7 → 0.3.8)       #
#   ./release.sh minor    # bump minor  (e.g. 0.3.7 → 0.4.0)       #
#   ./release.sh major    # bump major  (e.g. 0.3.7 → 1.0.0)       #
# ================================================================ #
set -e

# Ensure working tree is clean before releasing
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: working tree has uncommitted changes. Commit or stash them first."
    exit 1
fi

# Extract current version from Cargo.toml
VERSION=$(grep '^version = ' src-tauri/Cargo.toml | head -n 1 | awk -F '"' '{print $2}')
echo "Current version: $VERSION"

# Split into major, minor, patch
IFS='.' read -r -a version_parts <<< "$VERSION"
BUMP="${1:-patch}"

# Calculate new version based on the bump type
case "$BUMP" in
    major) NEW_VERSION="$((version_parts[0] + 1)).0.0" ;;
    minor) NEW_VERSION="${version_parts[0]}.$((version_parts[1] + 1)).0" ;;
    patch) NEW_VERSION="${version_parts[0]}.${version_parts[1]}.$((version_parts[2] + 1))" ;;
    *)
        echo "Error: invalid argument '$BUMP'. Use: major, minor, or patch (default)"
        exit 1
        ;;
esac

echo "New version: $NEW_VERSION"

# Update Cargo.toml
sed -i "s/^version = \".*\"/version = \"${NEW_VERSION}\"/" src-tauri/Cargo.toml

# Update tauri.conf.json
sed -i "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" src-tauri/tauri.conf.json

# Commit and tag
git add src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore: bump launcher version to v${NEW_VERSION}"
git tag "v${NEW_VERSION}"

echo "Pushing commits and tag v${NEW_VERSION}..."
git push
git push origin "v${NEW_VERSION}"

echo "Done. GitHub Actions will now build all platforms."
