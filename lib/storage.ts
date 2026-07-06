import {
  type AdminAuditLog,
  type AdminStats,
  type ConversationSummary,
  type InsertInterest, type InsertMessage,
  type InsertProfile, type InsertProject, type InsertProjectLog, type InsertReview,
  type Message,
  type Notification,
  type Profile, type Project, type ProjectInterest, type ProjectLog,
  type ProposalScreeningAnswer,
  type ReferenceLink,
  type ReviewWithUsers,
  type UpdateProfileRequest, type UpdateProjectRequest,
  type UpdateUserRequest,
  type User,
  type UserWithProfile
} from "@shared/schema";
import { redactContactInfo } from "@shared/redact";
import { sendNotificationEmail } from "@/lib/email";
import { createClient as createServerClient, createAuthenticatedClient } from "@/lib/supabase/server";
import {
  calculateProfileCompletionScore,
  calculateProjectCompletenessScore,
  calculateProjectRecommendationScore,
  calculateProposalMatchScore,
  normalizeProjectCategory,
  normalizeProjectCategories,
  normalizeTechnologyTags,
  sanitizeReferenceLinks,
  sanitizeScreeningAnswers,
  sanitizeStringArray,
} from "@shared/marketplace";

export interface IStorage {
  // Profiles
  getProfile(userId: string, token?: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile, userId: string, token?: string): Promise<Profile>;
  updateProfile(userId: string, updates: UpdateProfileRequest, token?: string): Promise<Profile>;

  // Projects
  getProject(id: number, token?: string): Promise<(Project & { client: User }) | undefined>;
  listProjects(filters?: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    clientId?: string;
    status?: string;
    sort?: string;
    requiredSkills?: string[];
    preferredExperienceLevel?: string;
    projectType?: string;
    scopeSize?: string;
    technologyTags?: string[];
    teamPreference?: string;
    currentUserId?: string;
  }, token?: string): Promise<(Project & { client: User })[]>;
  createProject(project: InsertProject, clientId: string, token?: string): Promise<Project>;
  updateProject(id: number, updates: UpdateProjectRequest, token?: string): Promise<Project>;
  deleteProject(id: number, token?: string): Promise<void>;

  // Interests
  createInterest(interest: InsertInterest, developerId: string, token?: string): Promise<ProjectInterest>;
  listInterests(projectId: number, options?: { sort?: string }, token?: string): Promise<(ProjectInterest & { developer: User })[]>;
  updateInterestStatus(interestId: number, status: "accepted" | "rejected", token?: string): Promise<ProjectInterest>;
  acceptProposal(projectId: number, interestId: number, token?: string): Promise<string[]>;
  withdrawProposal(projectId: number, interestId: number, token?: string): Promise<boolean>;

  // Project Assignment
  listAssignedProjects(developerId: string, token?: string): Promise<(Project & { client: User })[]>;

  // Project Logs
  listProjectLogs(projectId: number, token?: string): Promise<(ProjectLog & { author: User })[]>;
  createProjectLog(log: InsertProjectLog, authorId: string, token?: string): Promise<ProjectLog>;

  // Messages
  listMessages(projectId: number, userId: string, token?: string): Promise<(Message & { sender: User })[]>;
  listUserConversations(userId: string, token?: string): Promise<ConversationSummary[]>;
  markMessagesRead(projectId: number, userId: string, token?: string): Promise<number>;
  createMessage(message: InsertMessage, senderId: string, token?: string): Promise<Message>;

  // Reviews
  listProjectReviews(projectId: number, token?: string): Promise<ReviewWithUsers[]>;
  createReview(review: InsertReview, reviewerId: string, token?: string): Promise<ReviewWithUsers>;

  // Users
  getUser(id: string, token?: string, includeEmail?: boolean): Promise<User | undefined>;
  updateUser(id: string, updates: UpdateUserRequest, token?: string): Promise<User>;

  // Admin: Users
  listAllUsers(filters?: {
    role?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    includeDeleted?: boolean;
  }, token?: string): Promise<{ items: UserWithProfile[]; total: number }>;
  adminUpdateUser(userId: string, updates: UpdateUserRequest, token?: string): Promise<User>;
  softDeleteUser(userId: string, adminId: string, token?: string): Promise<void>;

  // Admin: Profiles
  adminUpdateProfile(userId: string, updates: UpdateProfileRequest, token?: string): Promise<Profile>;

  // Admin: Projects
  listAllProjectsAdmin(filters?: {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    includeDeleted?: boolean;
  }, token?: string): Promise<{ items: (Project & { client: User })[]; total: number }>;
  adminUpdateProject(projectId: number, updates: UpdateProjectRequest, token?: string): Promise<Project>;
  adminDeleteProject(projectId: number, token?: string): Promise<void>;

  // Admin: Statistics
  getAdminStats(token?: string): Promise<AdminStats>;

  // Admin: Audit Log
  createAuditLog(log: {
    adminId: string;
    action: string;
    targetType: "user" | "profile" | "project";
    targetId: string;
    details?: any;
  }, token?: string): Promise<void>;
  listAuditLogs(filters?: {
    adminId?: string;
    action?: string;
    page?: number;
    pageSize?: number;
  }, token?: string): Promise<{ items: AdminAuditLog[]; total: number }>;
}

// Helper to get the correct client (authenticated or anon)
async function getClient(token?: string) {
  if (token) {
    return createAuthenticatedClient(token);
  }
  return await createServerClient();
}

type ReviewSummary = {
  averageRating: number | null;
  reviewCount: number;
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function withReviewSummary(user: User, summary?: ReviewSummary): User {
  return {
    ...user,
    averageRating: summary?.averageRating ?? null,
    reviewCount: summary?.reviewCount ?? 0,
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toReferenceLinks(value: unknown): ReferenceLink[] {
  if (!Array.isArray(value)) return [];

  return sanitizeReferenceLinks(
    value.map((item) => ({
      label: typeof item?.label === "string" ? item.label : "",
      url: typeof item?.url === "string" ? item.url : "",
    })),
  );
}

function toScreeningAnswers(value: unknown): ProposalScreeningAnswer[] {
  if (!Array.isArray(value)) return [];

  return sanitizeScreeningAnswers(
    value.map((item) => ({
      question: typeof item?.question === "string" ? item.question : "",
      answer: typeof item?.answer === "string" ? item.answer : "",
    })),
  );
}

async function getReviewSummaryByUserIds(client: any, userIds: string[]): Promise<Map<string, ReviewSummary>> {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  const summaryMap = new Map<string, ReviewSummary>();

  if (uniqueUserIds.length === 0) {
    return summaryMap;
  }

  const { data, error } = await client
    .from("reviews")
    .select("reviewee_id, rating")
    .in("reviewee_id", uniqueUserIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const revieweeId = row.reviewee_id as string;
    const rating = Number(row.rating);
    const current = summaryMap.get(revieweeId) ?? { averageRating: 0, reviewCount: 0 };
    const nextCount = current.reviewCount + 1;
    const nextAverage = (((current.averageRating ?? 0) * current.reviewCount) + rating) / nextCount;

    summaryMap.set(revieweeId, {
      averageRating: Number(nextAverage.toFixed(1)),
      reviewCount: nextCount,
    });
  }

  return summaryMap;
}

// Helper to map public.users (snake_case) to User (camelCase)
function mapUser(row: any, includeEmail = false): User {
  if (!row) return row;
  return {
    id: row.id,
    // Email is sensitive PII — only surfaced to self/admin callers that opt in.
    email: includeEmail ? row.email : undefined,
    firstName: row.first_name,
    lastName: row.last_name,
    profileImageUrl: row.profile_image_url,
    averageRating: toNumber(row.average_rating ?? row.averageRating) ?? null,
    reviewCount: toNumber(row.review_count ?? row.reviewCount) ?? 0,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

// Helper to map DB profile to Profile
function mapProfile(row: any): Profile {
  if (!row) return row;
  const profile: Profile = {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    headline: row.headline,
    bio: row.bio,
    skills: sanitizeStringArray(row.skills),
    primaryCategories: normalizeProjectCategories(row.primary_categories),
    portfolioLinks: row.portfolio_links,
    experienceLevel: row.experience_level,
    availabilityStatus: row.availability_status,
    companyName: row.company_name,
    industry: row.industry,
    companySize: row.company_size,
    profileCompletionScore:
      toNumber(row.profile_completion_score) ?? calculateProfileCompletionScore({
        role: row.role,
        headline: row.headline,
        bio: row.bio,
        skills: row.skills,
        primaryCategories: normalizeProjectCategories(row.primary_categories),
        portfolioLinks: row.portfolio_links,
        experienceLevel: row.experience_level,
        availabilityStatus: row.availability_status,
        companyName: row.company_name,
        industry: row.industry,
        companySize: row.company_size,
      }),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
  return profile;
}

// Helper to map DB project to Project
function mapProject(row: any): Project {
  if (!row) return row;
  const project: Project = {
    id: row.id,
    clientId: row.client_id,
    assignedDeveloperId: row.assigned_developer_id,
    title: row.title,
    category: normalizeProjectCategory(row.category) ?? row.category,
    description: row.description,
    businessGoal: row.business_goal,
    currentState: row.current_state,
    targetUsers: row.target_users,
    projectType: row.project_type,
    scopeSize: row.scope_size,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    requiredSkills: sanitizeStringArray(row.required_skills),
    preferredSkills: sanitizeStringArray(row.preferred_skills),
    technologyTags: normalizeTechnologyTags(row.technology_tags),
    deliverables: sanitizeStringArray(row.deliverables),
    mustHaves: sanitizeStringArray(row.must_haves),
    niceToHaves: sanitizeStringArray(row.nice_to_haves),
    successCriteria: sanitizeStringArray(row.success_criteria),
    preferredExperienceLevel: row.preferred_experience_level,
    engagementType: row.engagement_type,
    teamPreference: row.team_preference,
    communicationCadence: row.communication_cadence,
    estimatedDurationWeeks: toNumber(row.estimated_duration_weeks),
    startDate: row.start_date,
    deadline: row.deadline,
    screeningQuestions: sanitizeStringArray(row.screening_questions),
    referenceLinks: toReferenceLinks(row.reference_links),
    status: row.status,
    recommendationScore: toNumber(row.recommendation_score),
    completenessScore:
      toNumber(row.completeness_score) ?? calculateProjectCompletenessScore({
        title: row.title,
        category: row.category,
        description: row.description,
        businessGoal: row.business_goal,
        projectType: row.project_type,
        scopeSize: row.scope_size,
        budgetMin: row.budget_min,
        budgetMax: row.budget_max,
        requiredSkills: row.required_skills,
        technologyTags: row.technology_tags,
        deliverables: row.deliverables,
        estimatedDurationWeeks: row.estimated_duration_weeks,
        deadline: row.deadline,
      }),
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
  return project;
}

// Helper to map DB project log to ProjectLog
function mapProjectLog(row: any): ProjectLog {
  if (!row) return row;
  return {
    id: row.id,
    projectId: row.project_id,
    authorId: row.author_id,
    content: row.content,
    logType: row.log_type,
    isSystem: Boolean(row.is_system),
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
}

// Helper to map DB interest to ProjectInterest
function mapInterest(row: any): ProjectInterest {
  if (!row) return row;
  return {
    id: row.id,
    projectId: row.project_id,
    developerId: row.developer_id,
    message: row.message,
    proposedBudget: toNumber(row.proposed_budget),
    estimatedDurationDays: toNumber(row.estimated_duration_days),
    relevantSkills: sanitizeStringArray(row.relevant_skills),
    screeningAnswers: toScreeningAnswers(row.screening_answers),
    status: row.status,
    matchScore: toNumber(row.match_score),
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
}

// Helper to map DB message to Message
function mapMessage(row: any): Message {
  if (!row) return row;
  return {
    id: row.id,
    projectId: row.project_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    read: row.read,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
}

// Helper to map DB audit log to AdminAuditLog
function mapAuditLog(row: any): AdminAuditLog {
  if (!row) return row;
  return {
    id: row.id,
    adminId: row.admin_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    details: row.details,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
}

function mapReview(row: any): ReviewWithUsers {
  if (!row) return row;
  return {
    id: row.id,
    projectId: row.project_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    reviewer: mapUser(row.reviewer),
    reviewee: mapUser(row.reviewee),
  };
}

function applyProjectSearch(query: any, search?: string) {
  if (!search?.trim()) return query;
  return query.textSearch("search_document", search.trim(), {
    config: "english",
    type: "websearch",
  });
}

function buildProjectPayload(values: Partial<InsertProject> & { status?: string }) {
  const payload: any = {};

  if (values.title !== undefined) payload.title = values.title;
  if (values.category !== undefined) payload.category = normalizeProjectCategory(values.category);
  if (values.description !== undefined) payload.description = values.description;
  if (values.businessGoal !== undefined) payload.business_goal = values.businessGoal;
  if (values.currentState !== undefined) payload.current_state = values.currentState || null;
  if (values.targetUsers !== undefined) payload.target_users = values.targetUsers || null;
  if (values.projectType !== undefined) payload.project_type = values.projectType;
  if (values.scopeSize !== undefined) payload.scope_size = values.scopeSize;
  if (values.budgetMin !== undefined) payload.budget_min = values.budgetMin;
  if (values.budgetMax !== undefined) payload.budget_max = values.budgetMax;
  if (values.requiredSkills !== undefined) payload.required_skills = sanitizeStringArray(values.requiredSkills);
  if (values.preferredSkills !== undefined) payload.preferred_skills = sanitizeStringArray(values.preferredSkills);
  if (values.technologyTags !== undefined) payload.technology_tags = normalizeTechnologyTags(values.technologyTags);
  if (values.deliverables !== undefined) payload.deliverables = sanitizeStringArray(values.deliverables);
  if (values.mustHaves !== undefined) payload.must_haves = sanitizeStringArray(values.mustHaves);
  if (values.niceToHaves !== undefined) payload.nice_to_haves = sanitizeStringArray(values.niceToHaves);
  if (values.successCriteria !== undefined) payload.success_criteria = sanitizeStringArray(values.successCriteria);
  if (values.preferredExperienceLevel !== undefined) {
    payload.preferred_experience_level = values.preferredExperienceLevel;
  }
  if (values.engagementType !== undefined) payload.engagement_type = values.engagementType;
  if (values.teamPreference !== undefined) payload.team_preference = values.teamPreference ?? null;
  if (values.communicationCadence !== undefined) payload.communication_cadence = values.communicationCadence ?? null;
  if (values.estimatedDurationWeeks !== undefined) {
    payload.estimated_duration_weeks = values.estimatedDurationWeeks ?? null;
  }
  if (values.startDate !== undefined) payload.start_date = values.startDate || null;
  if (values.deadline !== undefined) payload.deadline = values.deadline || null;
  if (values.screeningQuestions !== undefined) {
    payload.screening_questions = sanitizeStringArray(values.screeningQuestions);
  }
  if (values.referenceLinks !== undefined) payload.reference_links = sanitizeReferenceLinks(values.referenceLinks);
  if (values.status !== undefined) payload.status = values.status;

  return payload;
}

function mapNotification(row: Record<string, any>): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    type: row.type,
    projectId: row.project_id,
    content: row.content,
    read: row.read ?? false,
    createdAt: row.created_at,
  };
}

export class DatabaseStorage implements IStorage {
  // Notifications
  async createNotification(
    notification: Pick<Notification, "userId" | "type" | "projectId" | "content">,
    actorId: string,
    token?: string,
  ): Promise<void> {
    // Never notify yourself; never let a notification failure break the main action.
    if (notification.userId === actorId) return;
    try {
      const client = await getClient(token);
      const { error } = await client.from("notifications").insert({
        user_id: notification.userId,
        actor_id: actorId,
        type: notification.type,
        project_id: notification.projectId,
        content: notification.content,
      });
      if (error) throw error;
      // Also deliver by email (fail-open; no-op unless Resend is configured).
      await sendNotificationEmail(notification);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  async listNotifications(userId: string, token?: string): Promise<Notification[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return (data ?? []).map(mapNotification);
  }

  async markNotificationsRead(userId: string, token?: string): Promise<number> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)
      .select("id");

    if (error) throw error;
    return data?.length ?? 0;
  }

  // Profiles
  async getProfile(userId: string, token?: string): Promise<Profile | undefined> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return undefined;
    return mapProfile(data);
  }

  async createProfile(insertProfile: InsertProfile, userId: string, token?: string): Promise<Profile> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("profiles")
      .insert({
        user_id: userId,
        role: insertProfile.role,
        headline: insertProfile.headline,
        bio: insertProfile.bio,
        skills: sanitizeStringArray(insertProfile.skills),
        primary_categories: normalizeProjectCategories(insertProfile.primaryCategories),
        portfolio_links: insertProfile.portfolioLinks,
        experience_level: insertProfile.experienceLevel,
        availability_status: insertProfile.availabilityStatus,
        company_name: insertProfile.companyName,
        industry: insertProfile.industry,
        company_size: insertProfile.companySize,
      })
      .select()
      .single();

    if (error) throw error;
    return mapProfile(data);
  }

  async updateProfile(userId: string, updates: UpdateProfileRequest, token?: string): Promise<Profile> {
    const client = await getClient(token);
    const payload: any = {};
    // Defense-in-depth: self-service updates may only set client/developer.
    // Admin promotion goes through adminUpdateProfile behind requireAdmin.
    if (updates.role && updates.role !== "admin") payload.role = updates.role;
    if (updates.headline !== undefined) payload.headline = updates.headline;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.skills !== undefined) payload.skills = sanitizeStringArray(updates.skills);
    if (updates.primaryCategories !== undefined) {
      payload.primary_categories = normalizeProjectCategories(updates.primaryCategories);
    }
    if (updates.portfolioLinks !== undefined) payload.portfolio_links = updates.portfolioLinks;
    if (updates.experienceLevel !== undefined) payload.experience_level = updates.experienceLevel;
    if (updates.availabilityStatus !== undefined) payload.availability_status = updates.availabilityStatus;
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.industry !== undefined) payload.industry = updates.industry;
    if (updates.companySize !== undefined) payload.company_size = updates.companySize;

    const { data, error } = await client
      .from("profiles")
      .update({ ...payload, updated_at: new Date() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapProfile(data);
  }

  // Projects
  async getProject(id: number, token?: string): Promise<(Project & { client: User }) | undefined> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("projects")
      .select("*, client:client_id(*)")
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error || !data) return undefined;

    const project = mapProject(data);
    const reviewSummaryMap = await getReviewSummaryByUserIds(client, [data.client?.id]);
    const clientUser = withReviewSummary(mapUser(data.client), reviewSummaryMap.get(data.client?.id));
    return { ...project, client: clientUser };
  }

  async listProjects(filters?: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    clientId?: string;
    status?: string;
    sort?: string;
    requiredSkills?: string[];
    preferredExperienceLevel?: string;
    projectType?: string;
    scopeSize?: string;
    technologyTags?: string[];
    teamPreference?: string;
    currentUserId?: string;
  }, token?: string): Promise<(Project & { client: User })[]> {
    const client = await getClient(token);
    // Only the client "my projects" view renders proposalCount, so only pay for
    // the per-row interest-count aggregate when filtering by clientId; the
    // developer browse feed (highest traffic) skips it.
    const selectClause = filters?.clientId
      ? "*, client:client_id(*), project_interests!project_interests_project_id_fkey(count)"
      : "*, client:client_id(*)";
    let query = client
      .from("projects")
      .select(selectClause)
      .eq("is_deleted", false);

    if (filters?.clientId) {
      query = query.eq("client_id", filters.clientId);
    }
    if (filters?.category) {
      query = query.eq("category", normalizeProjectCategory(filters.category));
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    query = applyProjectSearch(query, filters?.search);
    if (filters?.minBudget !== undefined) {
      query = query.gte("budget_max", filters.minBudget);
    }
    if (filters?.maxBudget !== undefined) {
      query = query.lte("budget_min", filters.maxBudget);
    }
    if (filters?.preferredExperienceLevel) {
      query = query.eq("preferred_experience_level", filters.preferredExperienceLevel);
    }
    const requiredSkills = sanitizeStringArray(filters?.requiredSkills);
    if (requiredSkills.length > 0) {
      query = query.overlaps("required_skills", requiredSkills);
    }
    const technologyTags = normalizeTechnologyTags(filters?.technologyTags);
    if (technologyTags.length > 0) {
      query = query.overlaps("technology_tags", technologyTags);
    }
    if (filters?.projectType) {
      query = query.eq("project_type", filters.projectType);
    }
    if (filters?.scopeSize) {
      query = query.eq("scope_size", filters.scopeSize);
    }
    if (filters?.teamPreference) {
      query = query.eq("team_preference", filters.teamPreference);
    }

    switch (filters?.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "budget_high":
        query = query.order("budget_max", { ascending: false, nullsFirst: false });
        break;
      case "budget_low":
        query = query.order("budget_min", { ascending: true, nullsFirst: false });
        break;
      case "recommended":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as any[]) || [];
    const reviewSummaryMap = await getReviewSummaryByUserIds(
      client,
      rows.map((row) => row.client?.id).filter(Boolean),
    );

    let projects = rows.map((row) => ({
      ...mapProject(row),
      client: withReviewSummary(mapUser(row.client), reviewSummaryMap.get(row.client?.id)),
      // PostgREST returns the aggregate as [{ count }]; RLS scopes it to the
      // caller's visible interests (a client sees all proposals on their own
      // projects). Only surfaced on the client-facing card.
      proposalCount: Array.isArray(row.project_interests)
        ? row.project_interests[0]?.count ?? 0
        : 0,
    }));

    if (filters?.sort === "recommended" && filters.currentUserId) {
      const currentUserProfile = await this.getProfile(filters.currentUserId, token);
      projects = projects
        .map((project) => ({
          ...project,
          recommendationScore: calculateProjectRecommendationScore(project, currentUserProfile),
        }))
        .sort((a, b) => {
          const scoreDelta = (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0);
          if (scoreDelta !== 0) return scoreDelta;
          return (new Date(b.createdAt ?? 0).getTime()) - (new Date(a.createdAt ?? 0).getTime());
        });
    }

    return projects;
  }

  async createProject(insertProject: InsertProject, clientId: string, token?: string): Promise<Project> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("projects")
      .insert({ client_id: clientId, ...buildProjectPayload(insertProject), status: "open" })
      .select()
      .single();

    if (error) throw error;
    return mapProject(data);
  }

  async updateProject(id: number, updates: UpdateProjectRequest, token?: string): Promise<Project> {
    const client = await getClient(token);
    const payload = buildProjectPayload(updates);

    const { data, error } = await client
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapProject(data);
  }

  async deleteProject(id: number, token?: string): Promise<void> {
    const client = await getClient(token);
    const { error } = await client
      .from("projects")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) throw error;
  }

  // Interests
  async createInterest(insertInterest: InsertInterest, developerId: string, token?: string): Promise<ProjectInterest> {
    const client = await getClient(token);
    const { data: existingInterest, error: existingInterestError } = await client
      .from("project_interests")
      .select("id")
      .eq("project_id", insertInterest.projectId)
      .eq("developer_id", developerId)
      .in("status", ["pending", "accepted"])
      .limit(1);

    if (existingInterestError) throw existingInterestError;
    if ((existingInterest ?? []).length > 0) {
      const error = new Error("Developer already has an active proposal for this project.");
      (error as Error & { code?: string }).code = "ACTIVE_PROPOSAL_EXISTS";
      throw error;
    }

    const [{ data: projectRow, error: projectError }, { data: developerProfileRow, error: profileError }] = await Promise.all([
      client
        .from("projects")
        .select("*")
        .eq("id", insertInterest.projectId)
        .eq("is_deleted", false)
        .single(),
      client
        .from("profiles")
        .select("*")
        .eq("user_id", developerId)
        .single(),
    ]);

    if (projectError) throw projectError;
    if (profileError) throw profileError;

    const project = mapProject(projectRow);
    const developerProfile = mapProfile(developerProfileRow);
    const relevantSkills = sanitizeStringArray(insertInterest.relevantSkills);
    const screeningAnswers = sanitizeScreeningAnswers(insertInterest.screeningAnswers);
    const matchScore = calculateProposalMatchScore(project, developerProfile, relevantSkills, screeningAnswers);

    const { data, error } = await client
      .from("project_interests")
      .insert({
        project_id: insertInterest.projectId,
        developer_id: developerId,
        message: redactContactInfo(insertInterest.message).text,
        proposed_budget: insertInterest.proposedBudget,
        estimated_duration_days: insertInterest.estimatedDurationDays,
        relevant_skills: relevantSkills,
        screening_answers: screeningAnswers.map((answer) => ({
          question: answer.question,
          answer: redactContactInfo(answer.answer).text,
        })),
        match_score: matchScore,
      })
      .select()
      .single();

    if (error) throw error;
    return mapInterest(data);
  }

  async listInterests(projectId: number, options?: { sort?: string }, token?: string): Promise<(ProjectInterest & { developer: User })[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("project_interests")
      .select("*, developer:developer_id(*)")
      .eq("project_id", projectId);

    if (error) throw error;

    const rows = (data as any[]) || [];
    const reviewSummaryMap = await getReviewSummaryByUserIds(
      client,
      rows.map((row) => row.developer?.id).filter(Boolean),
    );

    const interests = rows.map((row) => ({
      ...mapInterest(row),
      developer: withReviewSummary(mapUser(row.developer), reviewSummaryMap.get(row.developer?.id)),
    }));

    switch (options?.sort) {
      case "best_match":
        return interests.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      case "lowest_budget":
        return interests.sort((a, b) => {
          const aBudget = a.proposedBudget ?? Number.MAX_SAFE_INTEGER;
          const bBudget = b.proposedBudget ?? Number.MAX_SAFE_INTEGER;
          return aBudget - bBudget;
        });
      case "fastest_delivery":
        return interests.sort((a, b) => {
          const aDuration = a.estimatedDurationDays ?? Number.MAX_SAFE_INTEGER;
          const bDuration = b.estimatedDurationDays ?? Number.MAX_SAFE_INTEGER;
          return aDuration - bDuration;
        });
      case "newest":
      default:
        return interests.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
    }
  }

  async updateInterestStatus(interestId: number, status: "accepted" | "rejected", token?: string): Promise<ProjectInterest> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("project_interests")
      .update({ status })
      .eq("id", interestId)
      .select()
      .single();

    if (error) throw error;
    return mapInterest(data);
  }

  // Atomic accept via the accept_proposal RPC (see migration
  // 20260706010000). Returns the developers whose proposals were auto-rejected
  // so the caller can notify them. RPC raises PROJECT_NOT_OPEN /
  // INTEREST_NOT_PENDING / FORBIDDEN / *_NOT_FOUND on invalid state.
  async acceptProposal(projectId: number, interestId: number, token?: string): Promise<string[]> {
    const client = await getClient(token);
    const { data, error } = await client.rpc("accept_proposal", {
      p_project_id: projectId,
      p_interest_id: interestId,
    });
    if (error) throw error;
    return ((data as { developer_id: string }[]) ?? []).map((row) => row.developer_id);
  }

  // Atomic withdraw via the withdraw_proposal RPC (migration 20260706020000):
  // notifies the client and deletes the interest in one transaction. Returns
  // false when there was no still-pending interest owned by the caller (lost
  // race / not the owner), so the route can 409 rather than report a false
  // withdrawal.
  async withdrawProposal(projectId: number, interestId: number, token?: string): Promise<boolean> {
    const client = await getClient(token);
    const { data, error } = await client.rpc("withdraw_proposal", {
      p_project_id: projectId,
      p_interest_id: interestId,
    });
    if (error) throw error;
    return data === true;
  }


  async listAssignedProjects(developerId: string, token?: string): Promise<(Project & { client: User })[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("projects")
      .select("*, client:client_id(*)")
      .eq("assigned_developer_id", developerId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data as any[]) || [];
    const reviewSummaryMap = await getReviewSummaryByUserIds(
      client,
      rows.map((row) => row.client?.id).filter(Boolean),
    );

    return rows.map((row) => ({
      ...mapProject(row),
      client: withReviewSummary(mapUser(row.client), reviewSummaryMap.get(row.client?.id)),
    }));
  }

  // Project Logs
  async listProjectLogs(projectId: number, token?: string): Promise<(ProjectLog & { author: User })[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("project_logs")
      .select("*, author:author_id(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data as any[]) || []).map(row => ({
      ...mapProjectLog(row),
      author: mapUser(row.author)
    }));
  }

  async createProjectLog(log: InsertProjectLog, authorId: string, token?: string): Promise<ProjectLog> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("project_logs")
      .insert({
        project_id: log.projectId,
        author_id: authorId,
        // Redact contact info in developer/client-authored logs (same channel as
        // messages). System logs are app-generated and never contain contact info.
        content: log.isSystem ? log.content : redactContactInfo(log.content).text,
        log_type: log.logType || "update",
        is_system: log.isSystem ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return mapProjectLog(data);
  }

  // Messages
  async listMessages(projectId: number, userId: string, token?: string): Promise<(Message & { sender: User })[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("messages")
      .select("*, sender:sender_id(*)")
      .eq("project_id", projectId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return ((data as any[]) || []).map(row => ({
      ...mapMessage(row),
      sender: mapUser(row.sender)
    }));
  }

  async listUserConversations(userId: string, token?: string): Promise<ConversationSummary[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("messages")
      .select("*, project:projects!messages_project_id_fkey(id, title), sender:sender_id(id, email, first_name, last_name, profile_image_url), receiver:receiver_id(id, email, first_name, last_name, profile_image_url)")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data as any[]) || [];
    const summaryMap = new Map<string, ConversationSummary>();
    const otherUserIds = new Set<string>();

    for (const row of rows) {
      const otherUserRow = row.sender_id === userId ? row.receiver : row.sender;
      if (!otherUserRow?.id) continue;

      otherUserIds.add(otherUserRow.id);
      const key = `${row.project_id}-${otherUserRow.id}`;
      const unreadDelta = row.receiver_id === userId && !row.read ? 1 : 0;

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          projectId: row.project_id,
          projectTitle: row.project?.title || "Untitled Project",
          otherUser: mapUser(otherUserRow),
          lastMessage: row.content,
          lastActivityAt: row.created_at,
          unreadCount: unreadDelta,
        });
        continue;
      }

      const current = summaryMap.get(key)!;
      current.unreadCount += unreadDelta;
    }

    const reviewSummaryMap = await getReviewSummaryByUserIds(client, [...otherUserIds]);
    return Array.from(summaryMap.values())
      .map((conversation) => ({
        ...conversation,
        otherUser: withReviewSummary(
          conversation.otherUser,
          reviewSummaryMap.get(conversation.otherUser.id),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
      );
  }

  async markMessagesRead(projectId: number, userId: string, token?: string): Promise<number> {
    const client = await getClient(token);
    const { data: unreadMessages, error: unreadMessagesError } = await client
      .from("messages")
      .select("id")
      .eq("project_id", projectId)
      .eq("receiver_id", userId)
      .eq("read", false);

    if (unreadMessagesError) throw unreadMessagesError;
    if (!unreadMessages || unreadMessages.length === 0) return 0;

    const unreadIds = unreadMessages.map((message: { id: number }) => message.id);
    const { error } = await client
      .from("messages")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) throw error;
    return unreadIds.length;
  }

  async createMessage(insertMessage: InsertMessage, senderId: string, token?: string): Promise<Message> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("messages")
      .insert({
        project_id: insertMessage.projectId,
        sender_id: senderId,
        receiver_id: insertMessage.receiverId,
        content: redactContactInfo(insertMessage.content).text,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return mapMessage(data);
  }

  // Reviews
  async listProjectReviews(projectId: number, token?: string): Promise<ReviewWithUsers[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("reviews")
      .select("*, reviewer:reviewer_id(*), reviewee:reviewee_id(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data as any[]) || [];
    const summaryMap = await getReviewSummaryByUserIds(
      client,
      rows.flatMap((row) => [row.reviewer?.id, row.reviewee?.id]).filter(Boolean),
    );

    return rows.map((row) => {
      const review = mapReview(row);
      return {
        ...review,
        reviewer: withReviewSummary(review.reviewer, summaryMap.get(review.reviewer.id)),
        reviewee: withReviewSummary(review.reviewee, summaryMap.get(review.reviewee.id)),
      };
    });
  }

  async createReview(insertReview: InsertReview, reviewerId: string, token?: string): Promise<ReviewWithUsers> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("reviews")
      .insert({
        project_id: insertReview.projectId,
        reviewer_id: reviewerId,
        reviewee_id: insertReview.revieweeId,
        rating: insertReview.rating,
        comment: insertReview.comment,
      })
      .select("*, reviewer:reviewer_id(*), reviewee:reviewee_id(*)")
      .single();

    if (error) throw error;

    const review = mapReview(data);
    const summaryMap = await getReviewSummaryByUserIds(client, [
      review.reviewer.id,
      review.reviewee.id,
    ]);

    return {
      ...review,
      reviewer: withReviewSummary(review.reviewer, summaryMap.get(review.reviewer.id)),
      reviewee: withReviewSummary(review.reviewee, summaryMap.get(review.reviewee.id)),
    };
  }

  // Users
  async getUser(id: string, token?: string, includeEmail = false): Promise<User | undefined> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    const reviewSummaryMap = await getReviewSummaryByUserIds(client, [id]);
    return withReviewSummary(mapUser(data, includeEmail), reviewSummaryMap.get(id));
  }

  async updateUser(id: string, updates: UpdateUserRequest, token?: string): Promise<User> {
    const client = await getClient(token);
    const payload: any = {};
    if (updates.firstName !== undefined) payload.first_name = updates.firstName;
    if (updates.lastName !== undefined) payload.last_name = updates.lastName;
    if (updates.profileImageUrl !== undefined) payload.profile_image_url = updates.profileImageUrl;

    const { data, error } = await client
      .from("users")
      .update({ ...payload, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    const reviewSummaryMap = await getReviewSummaryByUserIds(client, [id]);
    // Self-service update — the caller is updating their own record.
    return withReviewSummary(mapUser(data, true), reviewSummaryMap.get(id));
  }

  // ==================== ADMIN METHODS ====================

  // Admin: List all users with profiles
  async listAllUsers(
    filters?: {
      role?: string;
      search?: string;
      page?: number;
      pageSize?: number;
      includeDeleted?: boolean;
    },
    token?: string
  ): Promise<{ items: UserWithProfile[]; total: number }> {
    const client = await getClient(token);
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // First, get users with count
    let usersQuery = client
      .from("users")
      .select("*", { count: "exact" });

    if (!filters?.includeDeleted) {
      usersQuery = usersQuery.or("is_deleted.is.null,is_deleted.eq.false");
    }

    if (filters?.search) {
      // The search term is interpolated into a PostgREST `.or()` filter string,
      // so strip characters that could break out of the ilike pattern and inject
      // additional filter conditions (comma, parens, dot, colon, backslash, *).
      const safeSearch = filters.search.replace(/[,().:*\\%]/g, " ").trim();
      if (safeSearch) {
        usersQuery = usersQuery.or(
          `first_name.ilike.%${safeSearch}%,last_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`
        );
      }
    }

    usersQuery = usersQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: usersData, error: usersError, count } = await usersQuery;
    if (usersError) throw usersError;

    // Get profiles for these users
    const userIds = (usersData || []).map((u: any) => u.id);
    let profilesData: any[] = [];

    if (userIds.length > 0) {
      let profilesQuery = client
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (filters?.role) {
        profilesQuery = profilesQuery.eq("role", filters.role);
      }

      const { data, error } = await profilesQuery;
      if (error) throw error;
      profilesData = data || [];
    }

    // Create a map of profiles by user_id
    const profilesByUserId = new Map<string, any>();
    profilesData.forEach((p: any) => {
      profilesByUserId.set(p.user_id, p);
    });

    // Combine users with their profiles
    let items = (usersData || []).map((row: any) => {
      const profile = profilesByUserId.get(row.id);
      return {
        ...mapUser(row, true), // admin-only listing
        profile: profile ? mapProfile(profile) : null,
        isDeleted: row.is_deleted || false,
      };
    });

    // Filter by role if specified (post-filter since we need the join)
    if (filters?.role) {
      items = items.filter((u: UserWithProfile) => u.profile?.role === filters.role);
    }

    return { items, total: count || 0 };
  }

  // Admin: Update any user
  async adminUpdateUser(userId: string, updates: UpdateUserRequest, token?: string): Promise<User> {
    const client = await getClient(token);
    const payload: any = {};
    if (updates.firstName !== undefined) payload.first_name = updates.firstName;
    if (updates.lastName !== undefined) payload.last_name = updates.lastName;
    if (updates.profileImageUrl !== undefined) payload.profile_image_url = updates.profileImageUrl;

    const { data, error } = await client
      .from("users")
      .update({ ...payload, updated_at: new Date() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    const reviewSummaryMap = await getReviewSummaryByUserIds(client, [userId]);
    return withReviewSummary(mapUser(data, true), reviewSummaryMap.get(userId)); // admin
  }

  // Admin: Soft delete user and their projects
  async softDeleteUser(userId: string, adminId: string, token?: string): Promise<void> {
    const client = await getClient(token);

    // Soft delete the user
    const { error: userError } = await client
      .from("users")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: adminId,
      })
      .eq("id", userId);

    if (userError) throw userError;

    // Also soft-delete all their projects
    await client
      .from("projects")
      .update({ is_deleted: true })
      .eq("client_id", userId);

    // Log the action
    await this.createAuditLog(
      {
        adminId,
        action: "user_delete",
        targetType: "user",
        targetId: userId,
        details: { deletedAt: new Date().toISOString() },
      },
      token
    );
  }

  // Admin: Update any profile
  async adminUpdateProfile(userId: string, updates: UpdateProfileRequest, token?: string): Promise<Profile> {
    const client = await getClient(token);
    const payload: any = {};
    if (updates.role) payload.role = updates.role;
    if (updates.headline !== undefined) payload.headline = updates.headline;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.skills !== undefined) payload.skills = sanitizeStringArray(updates.skills);
    if (updates.primaryCategories !== undefined) {
      payload.primary_categories = normalizeProjectCategories(updates.primaryCategories);
    }
    if (updates.portfolioLinks !== undefined) payload.portfolio_links = updates.portfolioLinks;
    if (updates.experienceLevel !== undefined) payload.experience_level = updates.experienceLevel;
    if (updates.availabilityStatus !== undefined) payload.availability_status = updates.availabilityStatus;
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.industry !== undefined) payload.industry = updates.industry;
    if (updates.companySize !== undefined) payload.company_size = updates.companySize;

    const { data, error } = await client
      .from("profiles")
      .update({ ...payload, updated_at: new Date() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapProfile(data);
  }

  // Admin: List all projects
  async listAllProjectsAdmin(
    filters?: {
      status?: string;
      search?: string;
      page?: number;
      pageSize?: number;
      includeDeleted?: boolean;
    },
    token?: string
  ): Promise<{ items: (Project & { client: User })[]; total: number }> {
    const client = await getClient(token);
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    let query = client
      .from("projects")
      .select("*, client:client_id(*)", { count: "exact" });

    if (!filters?.includeDeleted) {
      query = query.eq("is_deleted", false);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    query = applyProjectSearch(query, filters?.search);

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const rows = (data as any[]) || [];
    const reviewSummaryMap = await getReviewSummaryByUserIds(
      client,
      rows.map((row) => row.client?.id).filter(Boolean),
    );

    const items = rows.map((row) => ({
      ...mapProject(row),
      client: withReviewSummary(mapUser(row.client, true), reviewSummaryMap.get(row.client?.id)), // admin
    }));

    return { items, total: count || 0 };
  }

  // Admin: Update any project
  async adminUpdateProject(projectId: number, updates: UpdateProjectRequest, token?: string): Promise<Project> {
    const client = await getClient(token);
    const payload = buildProjectPayload(updates);

    const { data, error } = await client
      .from("projects")
      .update(payload)
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return mapProject(data);
  }

  // Admin: Delete any project (soft delete)
  async adminDeleteProject(projectId: number, token?: string): Promise<void> {
    const client = await getClient(token);
    const { error } = await client
      .from("projects")
      .update({ is_deleted: true })
      .eq("id", projectId);

    if (error) throw error;
  }

  // Admin: Get statistics
  async getAdminStats(token?: string): Promise<AdminStats> {
    const client = await getClient(token);

    const [
      usersResult,
      developersResult,
      clientsResult,
      adminsResult,
      projectsResult,
      openProjectsResult,
      completedProjectsResult,
      assignedProjectsResult,
      projectInterestRows,
      reviewRows,
    ] = await Promise.all([
      client
        .from("users")
        .select("*", { count: "exact", head: true })
        .or("is_deleted.is.null,is_deleted.eq.false"),
      client
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "developer"),
      client
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client"),
      client
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),
      client
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false),
      client
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "open"),
      client
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "completed"),
      client
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .not("assigned_developer_id", "is", null),
      client
        .from("project_interests")
        .select("project_id, created_at, project:projects!project_interests_project_id_fkey(created_at, is_deleted)")
        .order("created_at", { ascending: true }),
      client
        .from("reviews")
        .select("project_id, project:projects!reviews_project_id_fkey(status, is_deleted)"),
    ]);

    if (projectInterestRows.error) throw projectInterestRows.error;
    if (reviewRows.error) throw reviewRows.error;

    const interests = (projectInterestRows.data as any[]) || [];
    const firstProposalByProject = new Map<number, number>();
    const projectsWithProposals = new Set<number>();

    for (const row of interests) {
      if (row.project?.is_deleted) continue;
      const projectId = Number(row.project_id);
      projectsWithProposals.add(projectId);

      const projectCreatedAt = new Date(row.project?.created_at).getTime();
      const proposalCreatedAt = new Date(row.created_at).getTime();
      if (!Number.isFinite(projectCreatedAt) || !Number.isFinite(proposalCreatedAt)) continue;

      const deltaHours = (proposalCreatedAt - projectCreatedAt) / (1000 * 60 * 60);
      if (!firstProposalByProject.has(projectId)) {
        firstProposalByProject.set(projectId, deltaHours);
      }
    }

    const avgTimeToFirstProposalHours =
      firstProposalByProject.size === 0
        ? 0
        : Number(
            (
              [...firstProposalByProject.values()].reduce((total, hours) => total + hours, 0) /
              firstProposalByProject.size
            ).toFixed(1),
          );

    const reviewedCompletedProjects = new Set<number>();
    for (const row of (reviewRows.data as any[]) || []) {
      if (row.project?.is_deleted) continue;
      if (row.project?.status !== "completed") continue;
      reviewedCompletedProjects.add(Number(row.project_id));
    }

    const completedProjects = completedProjectsResult.count || 0;
    const reviewSubmissionRate =
      completedProjects === 0
        ? 0
        : Number(((reviewedCompletedProjects.size / completedProjects) * 100).toFixed(1));

    return {
      totalUsers: usersResult.count || 0,
      totalDevelopers: developersResult.count || 0,
      totalClients: clientsResult.count || 0,
      totalAdmins: adminsResult.count || 0,
      totalProjects: projectsResult.count || 0,
      openProjects: openProjectsResult.count || 0,
      completedProjects,
      projectsWithProposals: projectsWithProposals.size,
      assignedProjects: assignedProjectsResult.count || 0,
      avgTimeToFirstProposalHours,
      reviewSubmissionRate,
    };
  }

  // Admin: Create audit log entry
  async createAuditLog(
    log: {
      adminId: string;
      action: string;
      targetType: "user" | "profile" | "project";
      targetId: string;
      details?: any;
    },
    token?: string
  ): Promise<void> {
    const client = await getClient(token);
    const { error } = await client.from("admin_audit_log").insert({
      admin_id: log.adminId,
      action: log.action,
      target_type: log.targetType,
      target_id: log.targetId,
      details: log.details,
    });

    if (error) {
      // Log error but don't throw - audit logging shouldn't break operations
      console.error("Failed to create audit log:", error);
    }
  }

  // Admin: List audit logs
  async listAuditLogs(
    filters?: {
      adminId?: string;
      action?: string;
      page?: number;
      pageSize?: number;
    },
    token?: string
  ): Promise<{ items: AdminAuditLog[]; total: number }> {
    const client = await getClient(token);
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    const offset = (page - 1) * pageSize;

    let query = client
      .from("admin_audit_log")
      .select("*", { count: "exact" });

    if (filters?.adminId) {
      query = query.eq("admin_id", filters.adminId);
    }

    if (filters?.action) {
      query = query.eq("action", filters.action);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const items = ((data as any[]) || []).map(mapAuditLog);
    return { items, total: count || 0 };
  }
}

export const storage = new DatabaseStorage();
