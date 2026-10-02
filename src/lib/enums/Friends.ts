/**
 * Where a friendship stands. Declining, cancelling and unfriending delete the
 * record outright, so there is no rejected state to represent.
 *
 * @enum {string}
 */
export enum FriendshipStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
}

/**
 * How a player in search results relates to whoever is searching, which decides
 * the button shown beside them.
 *
 * @enum {string}
 */
export enum FriendRelation {
  NONE = "none",
  PENDING_INCOMING = "pending_incoming",
  PENDING_OUTGOING = "pending_outgoing",
  FRIENDS = "friends",
}

/**
 * The sub-tabs on the Friends page.
 *
 * @enum {string}
 */
export enum FriendsTab {
  FRIENDS = "friends",
  REQUESTS = "requests",
  FIND = "find",
}
