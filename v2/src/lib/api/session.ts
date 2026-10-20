import { toErrorMessage } from "#lib/api/errors.js";
import { getAccount, logout } from "#lib/api/player.js";
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
    const { userId, username } = await getAccount();

    user.save({ token: user.token, language: user.language, userId, username });

    session.begin();
  } catch (error) {
    logs.error(`Could not validate the saved session: ${toErrorMessage(error)}`);
    if (session.status === "unknown") session.begin();
  }
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
