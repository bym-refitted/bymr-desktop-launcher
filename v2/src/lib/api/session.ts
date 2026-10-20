import { login, loginWithToken } from "#lib/api/auth.js";
import { toErrorMessage } from "#lib/api/errors.js";
import { getAccount, logout } from "#lib/api/player.js";
import type { Credentials, SavedUser } from "#lib/schemas.js";
import { logs } from "#lib/state/logs.svelte.js";
import { session } from "#lib/state/session.svelte.js";
import { user } from "#lib/state/user.svelte.js";

/**
 * Reads the token's own expiry, so a session that is plainly dead costs no request.
 * Anything unreadable is left for the server to judge.
 *
 * @param {string} token - The stored JWT.
 * @returns {boolean} True only when the token says it has expired.
 */
const hasExpired = (token: string) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

/**
 * Checks the loaded user's token with the server before the UI treats the player as
 * signed in. Must run after `app.gameVersion` is set, since it forms the API URL.
 *
 * @returns {Promise<void>} Resolves once the session is begun or ended.
 */
export const validateSession = async () => {
  if (!user.token) return session.end();

  if (hasExpired(user.token)) return session.end(true);

  try {
    const { userId, username, pic_square } = await getAccount();

    user.save({ token: user.token, language: user.language, userId, username, avatar: pic_square ?? "" });

    session.begin();
  } catch (error) {
    logs.error(`Could not validate the saved session: ${toErrorMessage(error)}`);
    if (session.status === "unknown") session.begin();
  }
};

/**
 * Signs in with an email and password and begins the session.
 *
 * @param {Credentials} credentials - The player's email and password.
 * @param {string} language - The language to play in, saved with the user.
 * @param {boolean} remember - Whether to remember the user on this device.
 * @returns {Promise<string>} The fresh session token, for launching the game.
 * @throws {ApiError | Error} When the details are wrong or the request fails.
 */
export const signIn = async (credentials: Credentials, language: string, remember: boolean) => {
  const { token, userId, username, pic_square } = await login(credentials);
  const details: SavedUser = { token, userId, username, language, avatar: pic_square ?? "" };

  if (remember) user.save(details);
  else user.set(details);

  session.begin();

  return token;
};

/**
 * Renews the signed-in user's token with the server, keeping them remembered if they were.
 *
 * @returns {Promise<string>} The fresh session token, for launching the game.
 * @throws {ApiError | Error} When the token is rejected or the request fails.
 */
export const refreshSession = async () => {
  const { token, userId, username, pic_square } = await loginWithToken(user.token);
  const details: SavedUser = { token, userId, username, language: user.language, avatar: pic_square ?? "" };

  if (user.remembered) user.save(details);
  else user.set(details);

  session.begin();

  return token;
};

/**
 * Signs out on the server, best effort since it needs the token, and then locally.
 *
 * @returns {Promise<void>} Resolves once the player is signed out locally.
 */
export const signOut = async () => {
  try {
    await logout();
  } catch (error) {
    logs.error(`Could not end the session on the server: ${toErrorMessage(error)}`);
  } finally {
    session.end();
  }
};
