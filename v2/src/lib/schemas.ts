import { z } from "zod";

/** A new player's username: 2 to 12 letters, numbers or underscores. Messages match the server's */
export const Username = z
  .string()
  .trim()
  .min(2, "Usernames must be between 2 and 12 characters")
  .max(12, "Usernames must be between 2 and 12 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Usernames can only contain letters, numbers and underscores");

/** An email address, trimmed and lowercased the way the server stores it */
export const Email = z.email("Invalid email address").trim().toLowerCase();

/** A password of at least 8 characters, with at least one special character. Messages match the server's */
export const Password = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

/** The sign-in form */
export const Credentials = z.object({ email: Email, password: Password });

export type Credentials = z.infer<typeof Credentials>;

/** The create-account form. The password has to be typed twice; only the first copy is sent */
export const Registration = z
  .object({ username: Username, email: Email, password: Password, confirmPassword: z.string() })
  .refine((details) => details.password === details.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type Registration = z.infer<typeof Registration>;

/** The forgot-password form */
export const ResetRequest = z.object({ email: Email });

/** The answer to signing in, with an email and password or a saved token. The token is fresh either way */
export const LoginResponse = z.object({
  token: z.string(),
  userId: z.number(),
  username: z.string(),
  pic_square: z.string().nullish(),
});

export type LoginResponse = z.infer<typeof LoginResponse>;

/** The signed-in player's account, used to check a saved session at start-up */
export const Account = z.object({
  userId: z.number(),
  username: z.string(),
  pic_square: z.string().nullish(),
});

export type Account = z.infer<typeof Account>;

/**
 * The player saved in localStorage when "Remember me" is ticked. Fields that are missing or broken fall back
 * to empty, so an older save still loads; only a missing token or user id discards it
 */
export const SavedUser = z.object({
  token: z.string().min(1),
  userId: z.number(),
  username: z.string().catch(""),
  language: z.string().catch(""),
  avatar: z.string().catch(""),
});

export type SavedUser = z.infer<typeof SavedUser>;

/** The languages the game can be played in, e.g. "English" */
export const Languages = z.array(z.string());

/** A Map Room world, named after whoever holds hex 0x0 */
export const World = z.object({
  uuid: z.string(),
  name: z.string(),
  playerCount: z.number(),
  map_version: z.number(),
});

export type World = z.infer<typeof World>;

/** Every world, across all Map Rooms */
export const Worlds = z.object({ worlds: z.array(World) });

/**
 * One player's ranking on a world. Counts arrive as strings, since Postgres returns COUNT as a bigint.
 * Strongholds are only counted on Map Room 3
 */
export const LeaderboardEntry = z.object({
  username: z.string(),
  discord_tag: z.string().nullish(),
  pic_square: z.string().nullish(),
  outpost_count: z.coerce.number(),
  stronghold_count: z.coerce.number().optional(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntry>;

/** A world's rankings, best first */
export const Leaderboard = z.object({ leaderboard: z.array(LeaderboardEntry) });

/** One battle the player fought, as attacker or defender. Inferno yards have no location */
export const AttackLog = z.object({
  id: z.number(),
  attacker_userid: z.number(),
  attacker_username: z.string(),
  attacker_pic_square: z.string().nullish(),
  defender_userid: z.number(),
  defender_username: z.string(),
  defender_pic_square: z.string().nullish(),
  type: z.string(),
  x: z.number().nullish(),
  y: z.number().nullish(),
  attacktime: z.coerce.date(),
});

export type AttackLog = z.infer<typeof AttackLog>;

/** The player's 50 most recent battles, newest first */
export const AttackLogs = z.object({ attackLogs: z.array(AttackLog) });
