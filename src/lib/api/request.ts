import { fetch } from "@tauri-apps/plugin-http";
import {
  ApiError,
  connectErrorMessage,
  isSessionError,
  timeoutErrorMessage,
  toErrorMessage,
} from "#lib/api/errors.js";
import { app } from "#lib/state/app.svelte.js";
import { build } from "#lib/state/build.svelte.js";
import { session } from "#lib/state/session.svelte.js";
import { user } from "#lib/state/user.svelte.js";

export type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  body?: unknown;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Builds an ApiError from a failed response, using the server's error message and
 * code when the body has them.
 *
 * @param {Response} response - The response with a non-2xx status.
 * @returns {Promise<ApiError>} The error to throw.
 */
const toApiError = async (response: Response) => {
  try {
    const { error, code } = await response.json();
    return new ApiError(toErrorMessage(error), response.status, code);
  } catch {
    return new ApiError(connectErrorMessage, response.status);
  }
};

/**
 * Calls the game API for the current game version and returns the JSON response.
 * A rejected session signs the player out.
 *
 * @param {Method} method - The HTTP method to use.
 * @param {string} path - The API route, e.g. "/player/account".
 * @param {RequestOptions} [options] - The request body, and a timeout in milliseconds (default 15 seconds).
 * @returns {Promise<unknown>} The parsed JSON response.
 * @throws {ApiError} When the server answers with an error status.
 * @throws {Error} When the server can't be reached or doesn't answer in time.
 */
export const apiRequest = async (method: Method, path: string, { body, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {}) => {
  const signal = AbortSignal.timeout(timeoutMs);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (user.signedIn) headers.Authorization = `Bearer ${user.token}`;

    const response = await fetch(
      `${build.apiBaseUrl}/api/v${app.gameVersion}-beta${path}`,
      {
        method,
        headers,
        body: JSON.stringify(body),
        signal,
      },
    );

    if (!response.ok) throw await toApiError(response);

    return await response.json();
  } catch (error) {
    if (isSessionError(error)) session.end(true);
    if (error instanceof ApiError) throw error;
    if (signal.aborted) throw new Error(timeoutErrorMessage);

    throw new Error(toErrorMessage(error));
  }
};
