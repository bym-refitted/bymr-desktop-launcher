import { Build, build } from "#lib/state/build.svelte.js";

export const connectErrorMessage = "Could not connect to the server. Please check the server status on our Discord. There may be an ongoing maintenance break or outage.";

const unexpectedErrorMessage = "An unexpected error occurred. Please try again later.";

export const ErrorCode = {
  sessionInvalid: "SESSION_INVALID",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * An error that keeps the server's status and code, so a rejected session can be
 * told apart from an unreachable server.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  /**
   * @param {string} message - The message to show the player.
   * @param {number} status - The HTTP status the server answered with.
   * @param {string} [code] - The server's machine-readable error code, if it sent one.
   */
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Whether the server refused our token, rather than the action.
 *
 * @param {unknown} error - The error thrown by apiRequest.
 * @returns {boolean} True only when the stored session is what was rejected.
 */
export const isSessionError = (error: unknown) =>
  error instanceof ApiError && error.code === ErrorCode.sessionInvalid;

/**
 * Turns any thrown value into a message fit to show the player.
 *
 * @param {unknown} error - The value that was thrown.
 * @returns {string} The message to display.
 */
export const toErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error || unexpectedErrorMessage;
  
  if (!(error instanceof Error)) return unexpectedErrorMessage;

  const message = error.message.trim();

  if (message.includes("Failed to fetch")) return connectErrorMessage;

  if (message.includes("error sending request for url")) {
    const isCustom = build.selected === Build.local;

    return isCustom ? "Could not reach the custom server. Make sure it is running at the address you entered." : connectErrorMessage;
  }

  return message || unexpectedErrorMessage;
};
