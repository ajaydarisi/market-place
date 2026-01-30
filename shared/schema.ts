import { z } from "zod";

// Export Auth models
export * from "./models/auth";

// === ENUMS ===
export const userRoles = ["client", "developer"] as const;
export const experienceLevels = ["junior", "mid", "senior", "lead"] as const;
export const availabilityStatuses = ["available", "busy", "open_to_offers"] as const;
export const projectStatuses = ["open", "in_progress", "completed", "cancelled"] as const;

// === TYPES ===
// Define interfaces via Zod

// USER
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

// ROLES
export const profileSchema = z.object({
  id: z.number().optional(),
  userId: z.string().uuid(),
  role: z.enum(userRoles).default("client"),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  portfolioLinks: z.any().optional(), // jsonb
  experienceLevel: z.enum(experienceLevels).nullable().optional(),
  availabilityStatus: z.enum(availabilityStatuses).default("available").optional(),
  updatedAt: z.date().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const projectSchema = z.object({
  id: z.number().optional(),
  clientId: z.string().uuid(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  deadline: z.string().or(z.date()).optional(), // timestamp
  status: z.enum(projectStatuses).default("open"),
  createdAt: z.date().optional(),
});

export type Project = z.infer<typeof projectSchema>;

export const projectInterestSchema = z.object({
  id: z.number().optional(),
  projectId: z.number(),
  developerId: z.string().uuid(),
  message: z.string(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  createdAt: z.date().optional(),
});

export type ProjectInterest = z.infer<typeof projectInterestSchema>;

export const messageSchema = z.object({
  id: z.number().optional(),
  projectId: z.number(),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  content: z.string(),
  read: z.boolean().default(false),
  createdAt: z.date().optional(),
});

export type Message = z.infer<typeof messageSchema>;

export const reviewSchema = z.object({
  id: z.number().optional(),
  projectId: z.number(),
  reviewerId: z.string().uuid(),
  revieweeId: z.string().uuid(),
  rating: z.number(),
  comment: z.string().optional(),
  createdAt: z.date().optional(),
});

export type Review = z.infer<typeof reviewSchema>;

// Input Schemas
export const insertUserSchema = userSchema.omit({ id: true, email: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = profileSchema.omit({ id: true, userId: true, updatedAt: true });
export const insertProjectSchema = projectSchema.omit({ id: true, clientId: true, createdAt: true, status: true });
export const insertInterestSchema = projectInterestSchema.omit({ id: true, developerId: true, createdAt: true, status: true });
export const insertMessageSchema = messageSchema.omit({ id: true, senderId: true, createdAt: true, read: true });
export const insertReviewSchema = reviewSchema.omit({ id: true, reviewerId: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// API Types
export type UpdateUserRequest = Partial<InsertUser>;
export type UpdateProfileRequest = Partial<InsertProfile>;
export type UpdateProjectRequest = Partial<InsertProject> & { status?: typeof projectStatuses[number] };
