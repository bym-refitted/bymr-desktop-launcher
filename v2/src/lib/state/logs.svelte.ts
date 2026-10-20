import { listen } from "@tauri-apps/api/event";

export type LogKind = "info" | "success" | "error";

export interface LogEntry {
  kind: LogKind;
  message: string;
  time: Date;
}

class Logs {
  entries = $state<LogEntry[]>([]);
  hasErrors = $derived(this.entries.some((entry) => entry.kind === "error"));

  /**
   * Adds an informational entry.
   *
   * @param {string} message - The text to log.
   */
  info(message: string) {
    this.#add("info", message);
  }

  /**
   * Adds a success entry.
   *
   * @param {string} message - The text to log.
   */
  success(message: string) {
    this.#add("success", message);
  }

  /**
   * Adds an error entry, which also flags the launcher as having errors.
   *
   * @param {string} message - The text to log.
   */
  error(message: string) {
    this.#add("error", message);
  }

  /**
   * Forwards the Rust side's `infoLog` and `errorLog` events into the log.
   *
   * @returns {Promise<UnlistenFn[]>} The functions that stop each listener.
   */
  listen() {
    return Promise.all([
      listen<{ message: string }>("infoLog", (event) => this.info(event.payload.message)),
      listen<{ message: string }>("errorLog", (event) => this.error(event.payload.message))
    ]);
  }

  /**
   * @param {LogKind} kind - How the entry is shown.
   * @param {string} message - The text to log.
   */
  #add(kind: LogKind, message: string) {
    this.entries.push({ kind, message, time: new Date() });
  }
}

export const logs = new Logs();
