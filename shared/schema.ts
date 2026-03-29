import { z } from "zod";

// Export Auth models
export * from "./models/auth";

// === ENUMS ===
export const userRoles = ["client", "developer", "admin"] as const;
export const experienceLevels = ["junior", "mid", "senior", "lead"] as const;
export const availabilityStatuses = ["available", "busy", "open_to_offers"] as const;
export const companySizes = ["solo", "small", "medium", "enterprise"] as const;
export const projectStatuses = ["open", "in_progress", "completed", "cancelled"] as const;
export const logTypes = ["update", "milestone", "blocker", "completed"] as const;
export const interestStatuses = ["pending", "accepted", "rejected"] as const;
export const engagementTypes = ["fixed", "hourly"] as const;
export const projectTypes = ["one_time", "milestone_based", "ongoing"] as const;
export const scopeSizes = ["small", "medium", "large"] as const;
export const teamPreferences = ["solo_freelancer", "small_team", "agency_ok"] as const;
export const communicationCadences = ["async_updates", "weekly_sync", "multi_weekly", "daily_collab"] as const;
export const proposalSortOptions = ["newest", "best_match", "lowest_budget", "fastest_delivery"] as const;

// === TYPES ===
// Define interfaces via Zod

// USER
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
   averageRating: z.number().nullable().optional(),
   reviewCount: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

// ROLES
export const profileSchema = z.object({
  id: z.number().optional(),
  userId: z.string().uuid(),
  role: z.enum(userRoles).default("client"),
  headline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  primaryCategories: z.array(z.string()).optional(),
  portfolioLinks: z.object({
    github: z.string().url().nullable().optional().or(z.literal("")),
    linkedin: z.string().url().nullable().optional().or(z.literal("")),
    website: z.string().url().nullable().optional().or(z.literal("")),
  }).nullable().optional(),
  experienceLevel: z.enum(experienceLevels).nullable().optional(),
  availabilityStatus: z.enum(availabilityStatuses).default("available").optional(),
  // Client-specific fields
  companyName: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  companySize: z.enum(companySizes).nullable().optional(),
  profileCompletionScore: z.number().min(0).max(100).optional(),
  updatedAt: z.date().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const referenceLinkSchema = z.object({
  label: z.string().min(1, "Link label is required"),
  url: z.string().url("Enter a valid URL"),
});

export type ReferenceLink = z.infer<typeof referenceLinkSchema>;

export const projectSchema = z.object({
  id: z.number().optional(),
  clientId: z.string().uuid(),
  assignedDeveloperId: z.string().uuid().nullable().optional(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  businessGoal: z.string().nullable().optional(),
  currentState: z.string().nullable().optional(),
  targetUsers: z.string().nullable().optional(),
  projectType: z.enum(projectTypes).nullable().optional(),
  scopeSize: z.enum(scopeSizes).nullable().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  technologyTags: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  mustHaves: z.array(z.string()).optional(),
  niceToHaves: z.array(z.string()).optional(),
  successCriteria: z.array(z.string()).optional(),
  preferredExperienceLevel: z.enum(experienceLevels).nullable().optional(),
  engagementType: z.enum(engagementTypes).nullable().optional(),
  teamPreference: z.enum(teamPreferences).nullable().optional(),
  communicationCadence: z.enum(communicationCadences).nullable().optional(),
  estimatedDurationWeeks: z.number().int().positive().nullable().optional(),
  startDate: z.string().or(z.date()).nullable().optional(),
  deadline: z.string().or(z.date()).optional(), // timestamp
  screeningQuestions: z.array(z.string()).optional(),
  referenceLinks: z.array(referenceLinkSchema).optional(),
  status: z.enum(projectStatuses).default("open"),
  recommendationScore: z.number().optional(),
  completenessScore: z.number().optional(),
  createdAt: z.date().optional(),
});

export type Project = z.infer<typeof projectSchema>;

export const proposalScreeningAnswerSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export type ProposalScreeningAnswer = z.infer<typeof proposalScreeningAnswerSchema>;

export const projectInterestSchema = z.object({
  id: z.number().optional(),
  projectId: z.number(),
  developerId: z.string().uuid(),
  message: z.string(),
  proposedBudget: z.number().nullable().optional(),
  estimatedDurationDays: z.number().int().positive().nullable().optional(),
  relevantSkills: z.array(z.string()).optional(),
  screeningAnswers: z.array(proposalScreeningAnswerSchema).optional(),
  status: z.enum(interestStatuses).default("pending"),
  matchScore: z.number().nullable().optional(),
  createdAt: z.date().optional(),
});

export type ProjectInterest = z.infer<typeof projectInterestSchema>;

export const projectLogSchema = z.object({
  id: z.number().optional(),
  projectId: z.number(),
  authorId: z.string().uuid(),
  content: z.string().min(1, "Log content is required"),
  logType: z.enum(logTypes).default("update"),
  isSystem: z.boolean().optional(),
  createdAt: z.date().optional(),
});

export type ProjectLog = z.infer<typeof projectLogSchema>;

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
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
  createdAt: z.date().optional(),
});

export type Review = z.infer<typeof reviewSchema>;

export const conversationSummarySchema = z.object({
  projectId: z.number(),
  projectTitle: z.string(),
  otherUser: userSchema,
  lastMessage: z.string(),
  lastActivityAt: z.string().or(z.date()),
  unreadCount: z.number(),
});

export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

export const reviewWithUsersSchema = reviewSchema.extend({
  reviewer: userSchema,
  reviewee: userSchema,
});

export type ReviewWithUsers = z.infer<typeof reviewWithUsersSchema>;

// Input Schemas
export const insertUserSchema = userSchema.omit({ id: true, email: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = profileSchema.omit({ id: true, userId: true, profileCompletionScore: true, updatedAt: true });
const projectInputBaseSchema = z.object({
  title: z.string().min(5, "Project title should be at least 5 characters"),
  category: z.string().min(1, "Select a category"),
  description: z.string().min(40, "Project overview should be at least 40 characters"),
  businessGoal: z.string().min(12, "Add the core business goal"),
  currentState: z.string().optional(),
  targetUsers: z.string().optional(),
  projectType: z.enum(projectTypes),
  scopeSize: z.enum(scopeSizes),
  budgetMin: z.number().positive("Minimum budget must be greater than 0"),
  budgetMax: z.number().positive("Maximum budget must be greater than 0"),
  requiredSkills: z.array(z.string()).min(1, "Add at least one required skill"),
  preferredSkills: z.array(z.string()).optional(),
  technologyTags: z.array(z.string()).min(1, "Add at least one technology tag"),
  deliverables: z.array(z.string()).min(1, "Add at least one deliverable"),
  mustHaves: z.array(z.string()).optional(),
  niceToHaves: z.array(z.string()).optional(),
  successCriteria: z.array(z.string()).optional(),
  preferredExperienceLevel: z.enum(experienceLevels).nullable().optional(),
  engagementType: z.enum(engagementTypes),
  teamPreference: z.enum(teamPreferences).nullable().optional(),
  communicationCadence: z.enum(communicationCadences).nullable().optional(),
  estimatedDurationWeeks: z.number().int().positive().nullable().optional(),
  startDate: z.string().or(z.date()).nullable().optional(),
  deadline: z.string().or(z.date()).nullable().optional(),
  screeningQuestions: z.array(z.string()).max(3, "Keep screening questions to 3 or fewer").optional(),
  referenceLinks: z.array(referenceLinkSchema).max(5, "Keep reference links to 5 or fewer").optional(),
});

function validateProjectPublish(
  values: z.infer<typeof projectInputBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (values.budgetMin > values.budgetMax) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["budgetMax"],
      message: "Maximum budget must be at least the minimum budget",
    });
  }

  if (!values.estimatedDurationWeeks && !values.deadline) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["estimatedDurationWeeks"],
      message: "Add a duration estimate or a deadline",
    });
  }
}

export const insertProjectSchema = projectInputBaseSchema.superRefine(validateProjectPublish);
export const updateProjectSchema = projectInputBaseSchema.partial().extend({
  status: z.enum(projectStatuses).optional(),
}).superRefine((values, ctx) => {
  if (
    values.budgetMin !== undefined &&
    values.budgetMax !== undefined &&
    values.budgetMin > values.budgetMax
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["budgetMax"],
      message: "Maximum budget must be at least the minimum budget",
    });
  }
});
export const insertInterestSchema = projectInterestSchema.omit({ id: true, developerId: true, createdAt: true, matchScore: true, status: true });
export const insertMessageSchema = messageSchema.omit({ id: true, senderId: true, createdAt: true, read: true });
export const insertReviewSchema = reviewSchema.omit({ id: true, reviewerId: true, createdAt: true });
export const insertProjectLogSchema = projectLogSchema.omit({ id: true, authorId: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertProjectLog = z.infer<typeof insertProjectLogSchema>;

// API Types
export type UpdateUserRequest = Partial<InsertUser>;
export type UpdateProfileRequest = Partial<InsertProfile>;
export type UpdateProjectRequest = Partial<InsertProject> & { status?: typeof projectStatuses[number] };

export const projectDraftSchema = projectInputBaseSchema.partial();
export const projectDraftResponseSchema = z.object({
  draft: projectDraftSchema,
  missingFields: z.array(z.string()),
  warnings: z.array(z.string()),
  source: z.enum(["heuristic", "provider", "disabled"]).default("heuristic"),
});

export type ProjectDraft = z.infer<typeof projectDraftSchema>;
export type ProjectDraftResponse = z.infer<typeof projectDraftResponseSchema>;

// Admin-specific types
export const adminAuditLogSchema = z.object({
  id: z.number().optional(),
  adminId: z.string().uuid(),
  action: z.string(),
  targetType: z.enum(["user", "profile", "project"]),
  targetId: z.string(),
  details: z.any().optional(),
  createdAt: z.date().optional(),
});

export type AdminAuditLog = z.infer<typeof adminAuditLogSchema>;

// User with profile combined (for admin views)
export const userWithProfileSchema = userSchema.extend({
  profile: profileSchema.nullable().optional(),
  isDeleted: z.boolean().optional(),
});

export type UserWithProfile = z.infer<typeof userWithProfileSchema>;

// Admin stats
export const adminStatsSchema = z.object({
  totalUsers: z.number(),
  totalDevelopers: z.number(),
  totalClients: z.number(),
  totalAdmins: z.number(),
  totalProjects: z.number(),
  openProjects: z.number(),
  completedProjects: z.number(),
  projectsWithProposals: z.number(),
  assignedProjects: z.number(),
  avgTimeToFirstProposalHours: z.number(),
  reviewSubmissionRate: z.number(),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;
