import { user } from "#lib/state/user.svelte.js";

export type SessionStatus = "unknown" | "valid" | "signedOut";

class Session {
  status = $state<SessionStatus>("unknown");
  expired = $state(false);

  /**
   * Marks the session as checked and live, after a login or a successful validation.
   */
  begin() {
    this.status = "valid";
    this.expired = false;
  }

  /**
   * Drops the saved session and signs the player out locally.
   *
   * @param {boolean} [wasRejected=false] - Whether the server turned the session down,
   * the only case worth interrupting the player about.
   */
  end(wasRejected = false) {
    user.clear();
    this.status = "signedOut";
    if (wasRejected) this.expired = true;
  }
}

export const session = new Session();
