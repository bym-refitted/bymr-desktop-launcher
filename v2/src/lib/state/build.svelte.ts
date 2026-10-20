import { VITE_BASE_URL } from "$app/env/public";
import { ServerUrl } from "#lib/schemas.js";

export const Build = {
  stable: "stable",
  local: "local",
} as const;

export type Build = (typeof Build)[keyof typeof Build];

const STORAGE_KEY = "serverUrl";
const DEFAULT_SERVER_URL = "http://localhost:3001";

/**
 * Reads the custom server address remembered on this device.
 *
 * @returns {string} The saved address, or the default local server.
 */
const loadServerUrl = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SERVER_URL;
  } catch {
    return DEFAULT_SERVER_URL;
  }
};

class BuildSettings {
  selected = $state<Build>(Build.stable);
  serverUrl = $state(loadServerUrl());

  #address = $derived(this.serverUrl.trim() || DEFAULT_SERVER_URL);

  #check = $derived(ServerUrl.safeParse(this.#address));

  serverUrlError = $derived(this.selected !== Build.local || this.#check.success ? "" : this.#check.error.issues[0].message);

  apiBaseUrl = $derived(this.selected === Build.local ? this.#address.replace(/\/+$/, "") : VITE_BASE_URL);

  serverHost = $derived.by(() => {
    try {
      return new URL(this.#address).host;
    } catch {
      return this.#address;
    }
  });

  /**
   * Points the launcher at a server, choosing Online for the official one and Custom for any other.
   *
   * @param {string} server - The server's base URL, e.g. the one a saved session belongs to.
   */
  select(server: string) {
    if (server === VITE_BASE_URL) {
      this.selected = Build.stable;
      return;
    }

    this.selected = Build.local;
    this.serverUrl = server;
  }

  /**
   * Remembers the custom server address on this device, so it's filled in next time.
   */
  rememberServerUrl() {
    try {
      localStorage.setItem(STORAGE_KEY, this.serverUrl.trim());
    } catch {}
  }
}

export const build = new BuildSettings();
