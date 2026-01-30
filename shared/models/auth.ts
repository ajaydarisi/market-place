import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UpsertUser = Partial<User>;

// Session type for compatibility if needed, though we are moving to Supabase Auth
export const sessionSchema = z.object({
  sid: z.string(),
  sess: z.any(),
  expire: z.date(),
});
