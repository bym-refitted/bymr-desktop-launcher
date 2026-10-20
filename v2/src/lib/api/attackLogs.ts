import { apiRequest } from "#lib/api/request.js";
import { AttackLogs } from "#lib/schemas.js";

export const AttackLogFilter = {
  both: "both",
  myAttacks: "myattacks",
  myDefences: "peopleattackingme",
} as const;

export type AttackLogFilter = (typeof AttackLogFilter)[keyof typeof AttackLogFilter];

/**
 * Fetches the signed-in player's 50 most recent battles. The server caches them for 30 minutes.
 *
 * @param {AttackLogFilter} filter - Whether to include the player's attacks, their defences, or both.
 * @returns {Promise<AttackLog[]>} The battles, newest first.
 * @throws {ApiError | Error} When the request fails or the response isn't a list of attack logs.
 */
export const getAttackLogs = async (filter: AttackLogFilter) =>
  AttackLogs.parse(await apiRequest("GET", `/attacklogs?${new URLSearchParams({ filter })}`)).attackLogs;
