import { invoke } from "@tauri-apps/api/core";
import { toErrorMessage } from "#lib/api/errors.js";
import { Build, build } from "#lib/state/build.svelte.js";
import { logs } from "#lib/state/logs.svelte.js";

type LaunchOptions = {
  buildName: Build;
  language: string;
  token: string;
  host?: string;
  port?: number;
};

class Launch {
  launching = $state(false);
  failed = $state(false);
  message = $state("");

  /**
   * Starts Flash Player with the selected build. A local build is also told which server to use.
   *
   * @param {string} token - The fresh session token the game signs in with.
   * @param {string} language - The language to play in, e.g. "English".
   * @returns {Promise<void>} Resolves once the game has started or the launch failed.
   */
  async start(token: string, language: string) {
    const isLocal = build.selected === Build.local;

    const options: LaunchOptions = {
      buildName: build.selected,
      language,
      token,
      host: isLocal ? build.host : undefined,
      port: isLocal ? build.port : undefined,
    };

    this.launching = true;

    try {
      await invoke("launch_game", options);
    } catch (error) {
      this.message = toErrorMessage(error);
      this.failed = true;
      logs.error(`The game could not be started: ${this.message}`);
    } finally {
      this.launching = false;
    }
  }
}

export const launch = new Launch();
