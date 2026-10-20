import { z } from "zod";

export const Account = z.object({
  userId: z.number(),
  username: z.string(),
});


export const SavedUser = z.object({
  token: z.string().min(1),
  userId: z.number(),
  username: z.string().catch(""),
  language: z.string().catch(""),
});

export type Account = z.infer<typeof Account>;
export type SavedUser = z.infer<typeof SavedUser>;
