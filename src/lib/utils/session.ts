import { get } from "svelte/store";

import { Method } from "$lib/enums/Method";
import { SessionState } from "$lib/enums/SessionState";
import { addErrorLog } from "$lib/stores/debugLogStore";
import {
  beginSession,
  endSession,
  sessionState,
} from "$lib/stores/sessionStore";
import { handleErrorMessage } from "$lib/errors/errorMessages";
import { invokeApiRequest } from "$lib/utils/invokeApiRequest";
import {
  loadUserFromLocalStorage,
  saveUserToLocalStorage,
  user,
} from "$lib/stores/userStore";

interface SessionResponse {
  userId: number;
  username: string;
}

const REQUEST_TIMEOUT_MS = 5000;

/**
 * Reads the token's own expiry, so a session that is plainly dead costs no request and is
 * caught even with no network. Anything unreadable - a malformed token, a missing exp -
 * compares false and is left for the server to judge.
 *
 * @param {string} token - The stored JWT.
 * @returns {boolean} True only when the token says it has expired.
 */
const hasExpired = (token: string): boolean => {
  try {
    const [_, payload] = token.split(".");
    const text = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    return JSON.parse(text).exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

/**
 * Checks the stored token with the server before any UI treats the player as signed in,
 * which is what keeps a launcher that looks logged in from failing on the first click.
 *
 * /player/account only reads: it answers once verifyUserAuth has accepted the token and
 * leaves the session itself alone. Logging in on Play is what re-issues a token, so a
 * validation that times out or is abandoned costs nothing.
 *
 * Must run after currentGameVersion is set, since that forms the API URL.
 */
export const validateSession = async (): Promise<void> => {
  loadUserFromLocalStorage();

  const token = get(user).token;

  if (!token) return endSession();
  if (hasExpired(token)) return endSession(true);

  try {
    const { data } = await invokeApiRequest<SessionResponse>(
      "/player/account",
      {},
      Method.GET,
      {
        timeoutMs: REQUEST_TIMEOUT_MS,
      },
    );

    if (data?.username)
      saveUserToLocalStorage({
        ...get(user),
        userId: data.userId,
        username: data.username,
      });

    beginSession();
  } catch (error) {
    addErrorLog(
      `Could not validate the saved session: ${handleErrorMessage(error)}`,
    );

    const isUnresolved = get(sessionState) === SessionState.UNKNOWN;

    if (isUnresolved) beginSession();
  }
};

/**
 * Signs out on both sides.
 *
 * Clearing our own storage only hides the token: it keeps working until it expires unless
 * the server drops it too. The request has to go first, since it authenticates with the
 * token endSession is about to clear, and it is best effort - the player is signed out
 * locally whether or not the server was reachable.
 */
export const signOut = async (): Promise<void> => {
  try {
    await invokeApiRequest("/player/logout", {}, Method.POST, {
      timeoutMs: REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    addErrorLog(
      `Could not end the session on the server: ${handleErrorMessage(error)}`,
    );
  } finally {
    endSession();
  }
};
