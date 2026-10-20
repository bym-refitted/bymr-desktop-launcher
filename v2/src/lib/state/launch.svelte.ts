import { invoke } from "@tauri-apps/api/core";
import { toErrorMessage } from "#lib/api/errors.js";
import { Build, build } from "#lib/state/build.svelte.js";
import { logs } from "#lib/state/logs.svelte.js";

const POKIES_BUILD = "pokies";

type LaunchOptions = {
  buildName: Build | typeof POKIES_BUILD;
  language: string;
  token?: string;
  host?: string;
  port?: number;
};

class Launch {
  launching = $state(false);
  failed = $state(false);
  message = $state("");

  /**
   * Starts the game with the selected build. A local build is also told which server to use.
   *
   * @param {string} token - The fresh session token the game signs in with.
   * @param {string} language - The language to play in, e.g. "English".
   * @returns {Promise<void>} Resolves once the game has started or the launch failed.
   */
  async start(token: string, language: string) {
    const isLocal = build.selected === Build.local;

    await this.#run({
      buildName: build.selected,
      language,
      token,
      host: isLocal ? build.host : undefined,
      port: isLocal ? build.port : undefined,
    });
  }

  /**
   * Starts the Attack of the Pokies minigame, which needs no account or server.
   *
   * @returns {Promise<void>} Resolves once the minigame has started or the launch failed.
   */
  async startPokies() {
    await this.#run({ buildName: POKIES_BUILD, language: "English" });
  }

  /**
   * Opens Flash Player through the launcher's Rust side, showing the launch error dialog if it fails.
   *
   * @param {LaunchOptions} options - The build and FlashVars to start Flash Player with.
   * @returns {Promise<void>} Resolves once Flash Player has started or the launch failed.
   */
  async #run(options: LaunchOptions) {
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
