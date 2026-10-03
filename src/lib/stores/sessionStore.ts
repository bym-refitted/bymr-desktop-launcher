import { writable } from "svelte/store";

import { SessionState } from "$lib/enums/SessionState";
import { removeUserFromLocalStorage } from "$lib/stores/userStore";

export const sessionState = writable<SessionState>(SessionState.UNKNOWN);

export const sessionExpired = writable<boolean>(false);

/**
 * Marks the session as checked and live, after a login or a successful validation.
 */
export const beginSession = () => {
  sessionState.set(SessionState.VALID);
  sessionExpired.set(false);
};

/**
 * Drops the stored session, whether it was rejected on startup or on a later request.
 *
 * @param {boolean} wasRejected - Whether the player had a session that the server turned
 * down, which is the only case worth interrupting them about.
 */
export const endSession = (wasRejected = false) => {
  removeUserFromLocalStorage();
  sessionState.set(SessionState.SIGNED_OUT);

  if (wasRejected) sessionExpired.set(true);
};
