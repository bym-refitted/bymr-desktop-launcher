import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { validateSession } from "#lib/api/session.js";
import { app } from "#lib/state/app.svelte.js";
import { logs } from "#lib/state/logs.svelte.js";
import { user } from "#lib/state/user.svelte.js";

/**
 * Installs a launcher update and relaunches, if one is available. Skipped on macOS.
 *
 * @returns {Promise<void>} Resolves when there is no update or it failed.
 */
const installUpdate = async () => {
  if (platform() === "macos") return;

  try {
    const update = await check();
    
    if (!update) return;

    await update.downloadAndInstall();
    await relaunch();
  } catch (error) {
    logs.error(`Could not update the launcher: ${error}`);
  }
};

/**
 * Starts the launcher: update check, log listeners, versions and the Flash
 * runtime, then loads and checks the saved user. Marks the app loaded either way.
 *
 * @returns {Promise<void>} Resolves once start-up has finished.
 */
export const startLauncher = async () => {
  await installUpdate();
  await logs.listen();

  try {
    const [launcherVersion, gameVersion] = await Promise.all([
      getVersion(),
      invoke<string>("get_current_game_version"),
      invoke("initialize_app"),
    ]);

    app.launcherVersion = launcherVersion;
    app.gameVersion = gameVersion;

    user.loadSaved();
    await validateSession();
    logs.success("Launcher initialized! 🚀");
  } catch (error) {
    logs.error(`Error during launcher initialization: ${error}`);
  } finally {
    app.loaded = true;
  }
};
