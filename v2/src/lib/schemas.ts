import { z } from "zod";

export const Account = z.object({
  userId: z.number(),
  username: z.string(),
  pic_square: z.string().nullish(),
});

export const SavedUser = z.object({
  token: z.string().min(1),
  userId: z.number(),
  username: z.string().catch(""),
  language: z.string().catch(""),
  avatar: z.string().catch(""),
});

export const Username = z
  .string()
  .trim()
  .min(2, "Usernames must be between 2 and 12 characters")
  .max(12, "Usernames must be between 2 and 12 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Usernames can only contain letters, numbers and underscores");

export const Email = z.email("Invalid email address").trim().toLowerCase();

export const Password = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const Credentials = z.object({ email: Email, password: Password });

export const Registration = z
  .object({ username: Username, email: Email, password: Password, confirmPassword: z.string() })
  .refine((details) => details.password === details.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetRequest = z.object({ email: Email });

export const LoginResponse = z.object({
  token: z.string(),
  userId: z.number(),
  username: z.string(),
  pic_square: z.string().nullish(),
});

export const Languages = z.array(z.string());

export type Account = z.infer<typeof Account>;
export type SavedUser = z.infer<typeof SavedUser>;
export type Credentials = z.infer<typeof Credentials>;
export type Registration = z.infer<typeof Registration>;
export type LoginResponse = z.infer<typeof LoginResponse>;
