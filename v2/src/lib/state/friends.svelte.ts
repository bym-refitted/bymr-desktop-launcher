import { toErrorMessage } from "#lib/api/errors.js";
import {
  FriendRelation,
  FriendshipStatus,
  getFriends,
  removeFriend,
  respondToRequest,
  searchPlayers,
  sendFriendRequest,
  sendGift,
} from "#lib/api/friends.js";
import type { Friend, FriendPlayer, FriendRequest, PlayerResult } from "#lib/schemas.js";
import { logs } from "#lib/state/logs.svelte.js";

const GIFT_COOLDOWN_SECONDS = 24 * 60 * 60;

export const SEARCH_MIN_LENGTH = 2;

class Friends {
  friends = $state<Friend[]>([]);
  incoming = $state<FriendRequest[]>([]);
  outgoing = $state<FriendRequest[]>([]);
  loading = $state(false);
  term = $state("");
  results = $state<PlayerResult[]>([]);
  searching = $state(false);
  searched = $state(false);
  busy = $state<number[]>([]);
  error = $state("");

  /**
   * Whether an action on a player is still waiting on the server.
   *
   * @param {number} userId - The player to check.
   * @returns {boolean} True while their buttons should stay disabled.
   */
  isBusy(userId: number) {
    return this.busy.includes(userId);
  }

  /**
   * Fetches the friends list, showing the loading state while it arrives.
   *
   * @returns {Promise<void>} Resolves once the list is shown or the request failed.
   */
  async load() {
    this.loading = true;
    await this.#refresh();
    this.loading = false;
  }

  /**
   * Searches players by the current term, dropping the answer if the term changed meanwhile.
   *
   * @returns {Promise<void>} Resolves once the results are shown or the request failed.
   */
  async search() {
    const query = this.term.trim();

    if (query.length < SEARCH_MIN_LENGTH) {
      this.results = [];
      this.searched = false;
      return;
    }

    this.searching = true;

    try {
      const players = await searchPlayers(query);
      if (query === this.term.trim()) this.results = players;
    } catch (failure) {
      this.#fail(failure, "Could not search players");
    } finally {
      if (query === this.term.trim()) {
        this.searching = false;
        this.searched = true;
      }
    }
  }

  /**
   * Sends a friend request, which becomes a friendship straight away if they had already asked.
   *
   * @param {FriendPlayer} player - The player to befriend.
   * @returns {Promise<void>} Resolves once the request is sent or failed.
   */
  async add(player: FriendPlayer) {
    await this.#act(player, `Could not add ${player.username}`, async () => {
      const status = await sendFriendRequest(player.user_id);
      const accepted = status === FriendshipStatus.accepted;

      this.#setRelation(player.user_id, accepted ? FriendRelation.friends : FriendRelation.pendingOutgoing);
    });
  }

  /**
   * Accepts or declines a request someone sent the player.
   *
   * @param {FriendPlayer & { request_id: number | null }} player - The player who asked, with their request.
   * @param {boolean} accept - True to accept, false to decline.
   * @returns {Promise<void>} Resolves once the answer is sent or failed.
   */
  async respond(player: FriendPlayer & { request_id: number | null }, accept: boolean) {
    const requestId = player.request_id;

    if (!requestId) return;

    await this.#act(player, `Could not answer ${player.username}`, async () => {
      await respondToRequest(requestId, accept);

      this.#setRelation(player.user_id, accept ? FriendRelation.friends : FriendRelation.none);
    });
  }

  /**
   * Removes a friend, or cancels a request the player sent them.
   *
   * @param {FriendPlayer} player - The other player.
   * @returns {Promise<void>} Resolves once they're removed or the request failed.
   */
  async remove(player: FriendPlayer) {
    await this.#act(player, `Could not remove ${player.username}`, async () => {
      await removeFriend(player.user_id);

      this.#setRelation(player.user_id, FriendRelation.none);
    });
  }

  /**
   * Sends a friend a mystery sack, then starts their cooldown locally so the button settles at once.
   *
   * @param {Friend} friend - The friend to gift.
   * @returns {Promise<void>} Resolves once the sack is sent or the request failed.
   */
  async gift(friend: Friend) {
    await this.#act(friend, `Could not send ${friend.username} a sack`, async () => {
      await sendGift(friend.user_id);

      const readyAt = Math.floor(Date.now() / 1000) + GIFT_COOLDOWN_SECONDS;

      this.friends = this.friends.map((entry) => (entry.user_id === friend.user_id ? { ...entry, gift_ready_at: readyAt } : entry));
    });
  }

  /**
   * Fetches the friends list without the loading state, so it can refresh behind the current list.
   *
   * @returns {Promise<void>} Resolves once the list is updated or the request failed.
   */
  async #refresh() {
    try {
      const list = await getFriends();

      this.friends = list.friends;
      this.incoming = list.incoming;
      this.outgoing = list.outgoing;
    } catch (failure) {
      this.#fail(failure, "Could not load friends");
    }
  }

  /**
   * Runs an action on a player, keeping their buttons disabled meanwhile and refreshing the list after.
   *
   * @param {FriendPlayer} player - The player being acted on.
   * @param {string} failureMessage - What to log if it fails, e.g. "Could not add Gorgo".
   * @param {() => Promise<void>} action - The request and any local update.
   * @returns {Promise<void>} Resolves once the action and the refresh have finished.
   */
  async #act(player: FriendPlayer, failureMessage: string, action: () => Promise<void>) {
    this.busy = [...this.busy, player.user_id];
    this.error = "";

    try {
      await action();
      await this.#refresh();
    } catch (failure) {
      this.#fail(failure, failureMessage);
    } finally {
      this.busy = this.busy.filter((id) => id !== player.user_id);
    }
  }

  /**
   * Re-labels a search result after acting on them, so its button follows without searching again.
   *
   * @param {number} userId - The player to re-label.
   * @param {FriendRelation} relation - How they now relate to the searcher.
   */
  #setRelation(userId: number, relation: FriendRelation) {
    this.results = this.results.map((player) => (player.user_id === userId ? { ...player, relation, request_id: null } : player));
  }

  /**
   * Shows a failure above the list and logs it.
   *
   * @param {unknown} failure - What was thrown.
   * @param {string} message - What was being done, e.g. "Could not load friends".
   */
  #fail(failure: unknown, message: string) {
    this.error = toErrorMessage(failure);
    logs.error(`${message}: ${this.error}`);
  }
}

export const friends = new Friends();
