import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { validateSession } from "#lib/api/session.js";
import { app } from "#lib/state/app.svelte.js";
import { build } from "#lib/state/build.svelte.js";
import { logs } from "#lib/state/logs.svelte.js";
import { user } from "#lib/state/user.svelte.js";

const UPDATE_CHECK_TIMEOUT_MS = 5_000;

/**
 * Checks for a launcher update, giving up after a few seconds so a slow or blocked update server can't hold up start-up.
 * Skipped on macOS.
 *
 * @returns {Promise<Update | null>} The available update, or null if there is none or the check failed.
 */
const findUpdate = async () => {
  if (platform() === "macos") return null;

  try {
    return await check({ timeout: UPDATE_CHECK_TIMEOUT_MS });
  } catch (error) {
    logs.error(`Could not check for launcher updates: ${error}`);
    return null;
  }
};

/**
 * Downloads and installs a launcher update, then relaunches into it.
 *
 * @param {Update} update - The update to install.
 * @returns {Promise<void>} Resolves only if the install failed, since a successful one relaunches.
 */
const installUpdate = async (update: Update) => {
  try {
    await update.downloadAndInstall();
    await relaunch();
  } catch (error) {
    logs.error(`Could not update the launcher: ${error}`);
  }
};

/**
 * Loads versions and the Flash runtime, then restores and checks the saved user.
 *
 * @returns {Promise<void>} Resolves once loading has finished or failed.
 */
const loadLauncher = async () => {
  try {
    const [launcherVersion, gameVersion] = await Promise.all([
      getVersion(),
      invoke<string>("get_current_game_version"),
      invoke("initialize_app"),
    ]);

    app.launcherVersion = launcherVersion;
    app.gameVersion = gameVersion;

    user.loadSaved();
    if (user.token) build.select(user.server);

    await validateSession();
    logs.success("Launcher initialized! 🚀");
  } catch (error) {
    logs.error(`Error during launcher initialization: ${error}`);
  }
};

/**
 * Starts the launcher. The update check runs alongside loading, and an update is installed before the launcher is shown,
 * so it never relaunches while the player is using it. Marks the app loaded once both have finished.
 *
 * @returns {Promise<void>} Resolves once start-up has finished.
 */
export const startLauncher = async () => {
  await logs.listen();

  const updateCheck = findUpdate();

  await loadLauncher();

  const update = await updateCheck;

  if (update) await installUpdate(update);

  app.loaded = true;
};
