import { apiRequest } from "#lib/api/request.js";
import { Languages, LoginResponse, type Credentials, type Registration } from "#lib/schemas.js";

const SESSION_TYPE = "launcher";

/**
 * Signs in with an email and password.
 *
 * @param {Credentials} credentials - The player's email and password.
 * @returns {Promise<LoginResponse>} A fresh token, with the player's id and username.
 * @throws {ApiError | Error} When the details are wrong or the request fails.
 */
export const login = async ({ email, password }: Credentials) =>
  LoginResponse.parse(await apiRequest("POST", "/player/getinfo", { body: { email, password, sessionType: SESSION_TYPE } }));

/**
 * Signs in again with a saved token, which renews it.
 *
 * @param {string} token - The saved session token.
 * @returns {Promise<LoginResponse>} A fresh token, with the player's id and username.
 * @throws {ApiError | Error} When the token is rejected or the request fails.
 */
export const loginWithToken = async (token: string) =>
  LoginResponse.parse(await apiRequest("POST", "/player/getinfo", { body: { token, sessionType: SESSION_TYPE } }));

/**
 * Creates an account. The player still has to verify it on Discord before playing.
 *
 * @param {Registration} details - The new account's username, email and password.
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When the username or email is taken, or the request fails.
 */
export const register = ({ username, email, password }: Registration) =>
  apiRequest("POST", "/player/register", { body: { username, email, password } });

/**
 * Asks the server to email a password reset link.
 *
 * @param {string} email - The account's email address.
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When the email can't be sent or the request fails.
 */
export const requestPasswordReset = (email: string) => apiRequest("POST", "/player/forgotPassword", { body: { email } });

/**
 * Fetches the languages the game can be played in.
 *
 * @returns {Promise<string[]>} The language names, e.g. "English".
 * @throws {ApiError | Error} When the request fails.
 */
export const getLanguages = async () => Languages.parse(await apiRequest("GET", "/supportedLangs"));
