import { apiRequest } from "#lib/api/request.js";
import { Account, AccountDetails, SettingsUpdate, UsernameChange, type Settings } from "#lib/schemas.js";

const TIMEOUT_MS = 5000;

/**
 * Fetches the signed-in player's account.
 *
 * @returns {Promise<Account>} The player's id and username.
 * @throws {ApiError | Error} When the request fails or the response isn't an account.
 */
export const getAccount = async () => Account.parse(await apiRequest("GET", "/player/account"));

/**
 * Fetches the signed-in player's full account, for the account page.
 *
 * @returns {Promise<AccountDetails>} The account, its username cooldown and its settings.
 * @throws {ApiError | Error} When the request fails or the response isn't an account.
 */
export const getAccountDetails = async () => AccountDetails.parse(await apiRequest("GET", "/player/account"));

/**
 * Changes the signed-in player's username, which starts a 6 month cooldown.
 *
 * @param {string} username - The new username.
 * @returns {Promise<UsernameChange>} The saved username and when it can next be changed.
 * @throws {ApiError | Error} When the name is taken, the cooldown hasn't passed, or the request fails.
 */
export const changeUsername = async (username: string) =>
  UsernameChange.parse(await apiRequest("POST", "/player/changeusername", { body: { username } }));

/**
 * Saves the signed-in player's settings.
 *
 * @param {Settings} settings - The whole settings block.
 * @returns {Promise<Settings>} The settings the server saved.
 * @throws {ApiError | Error} When the request fails.
 */
export const updateSettings = async (settings: Settings) =>
  SettingsUpdate.parse(await apiRequest("POST", "/player/settings", { body: settings })).settings;

/**
 * Ends the player's session on the server.
 *
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When the request fails.
 */
export const logout = () => apiRequest("POST", "/player/logout", { timeoutMs: TIMEOUT_MS });
