import { apiRequest } from "#lib/api/request.js";
import { Leaderboard, Worlds } from "#lib/schemas.js";

export const MapRoom = {
  v2: "2",
  v3: "3",
} as const;

export type MapRoom = (typeof MapRoom)[keyof typeof MapRoom];

/**
 * Fetches every world across all Map Rooms.
 *
 * @returns {Promise<World[]>} Each world's id, name, population and Map Room version.
 * @throws {ApiError | Error} When the request fails or the response isn't a world list.
 */
export const getWorlds = async () => Worlds.parse(await apiRequest("GET", "/worlds")).worlds;

/**
 * Fetches a world's rankings. The server caches them for two hours.
 *
 * @param {string} worldid - The world to rank.
 * @param {MapRoom} mapversion - The world's Map Room, which decides what is counted.
 * @returns {Promise<LeaderboardEntry[]>} The players, best first.
 * @throws {ApiError | Error} When the request fails or the response isn't a leaderboard.
 */
export const getLeaderboard = async (worldid: string, mapversion: MapRoom) =>
  Leaderboard.parse(await apiRequest("GET", `/leaderboards?${new URLSearchParams({ worldid, mapversion })}`)).leaderboard;
