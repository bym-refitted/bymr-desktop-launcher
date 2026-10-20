import { apiRequest } from "#lib/api/request.js";
import { Account } from "#lib/schemas.js";

const TIMEOUT_MS = 5000;

/**
 * Fetches the signed-in player's account.
 *
 * @returns {Promise<Account>} The player's id and username.
 * @throws {ApiError | Error} When the request fails or the response isn't an account.
 */
export const getAccount = async () => Account.parse(await apiRequest("GET", "/player/account", { timeoutMs: TIMEOUT_MS }));

/**
 * Ends the player's session on the server.
 *
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When the request fails.
 */
export const logout = () => apiRequest("POST", "/player/logout", { timeoutMs: TIMEOUT_MS });
