import { apiRequest } from "#lib/api/request.js";
import { FriendList, FriendRequestResult, PlayerSearch } from "#lib/schemas.js";

export const FriendRelation = {
  none: "none",
  pendingIncoming: "pending_incoming",
  pendingOutgoing: "pending_outgoing",
  friends: "friends",
} as const;

export type FriendRelation = (typeof FriendRelation)[keyof typeof FriendRelation];

export const FriendshipStatus = {
  pending: "pending",
  accepted: "accepted",
} as const;

export type FriendshipStatus = (typeof FriendshipStatus)[keyof typeof FriendshipStatus];

/**
 * Fetches the player's friends and the requests waiting on either side.
 *
 * @returns {Promise<FriendList>} Friends with their gift cooldowns, incoming requests and outgoing requests.
 * @throws {ApiError | Error} When the request fails or the response isn't a friend list.
 */
export const getFriends = async () => FriendList.parse(await apiRequest("GET", "/friends"));

/**
 * Searches players by name.
 *
 * @param {string} search - At least 2 characters of a username.
 * @returns {Promise<PlayerResult[]>} Matching players, with how each relates to the searcher.
 * @throws {ApiError | Error} When the request fails or the response isn't a list of players.
 */
export const searchPlayers = async (search: string) =>
  PlayerSearch.parse(await apiRequest("GET", `/friends/search?${new URLSearchParams({ search })}`)).players;

/**
 * Sends a friend request, or accepts theirs if they had already asked.
 *
 * @param {number} userid - The player to befriend.
 * @returns {Promise<string>} The friendship's status afterwards, pending or accepted.
 * @throws {ApiError | Error} When the request fails.
 */
export const sendFriendRequest = async (userid: number) =>
  FriendRequestResult.parse(await apiRequest("POST", "/friends/request", { body: { userid } })).status;

/**
 * Accepts or declines an incoming friend request.
 *
 * @param {number} requestId - The request to answer.
 * @param {boolean} accept - True to accept, false to decline.
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When the request fails.
 */
export const respondToRequest = (requestId: number, accept: boolean) =>
  apiRequest("POST", "/friends/respond", { body: { request_id: requestId, accept } });

/**
 * Removes a friend, or cancels a request the player sent them.
 *
 * @param {number} userid - The other player.
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When the request fails.
 */
export const removeFriend = (userid: number) => apiRequest("POST", "/friends/remove", { body: { userid } });

/**
 * Sends a friend a mystery sack, which waits on their base until they next load it.
 *
 * @param {number} userid - The friend to gift.
 * @returns {Promise<unknown>} The server's acknowledgement, which callers can ignore.
 * @throws {ApiError | Error} When it's too soon since the last gift, their pile is full, or the request fails.
 */
export const sendGift = (userid: number) => apiRequest("POST", "/gifts/send", { body: { userid } });
