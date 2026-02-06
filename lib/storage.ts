import {
  type AdminAuditLog,
  type AdminStats,
  type InsertInterest, type InsertMessage,
  type InsertProfile, type InsertProject, type InsertProjectLog,
  type Message,
  type Profile, type Project, type ProjectInterest, type ProjectLog,
  type UpdateProfileRequest, type UpdateProjectRequest,
  type UpdateUserRequest,
  type User,
  type UserWithProfile
} from "@shared/schema";
import { createClient as createServerClient, createAuthenticatedClient } from "@/lib/supabase/server";

export interface IStorage {
  // Profiles
  getProfile(userId: string, token?: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile, userId: string, token?: string): Promise<Profile>;
  updateProfile(userId: string, updates: UpdateProfileRequest, token?: string): Promise<Profile>;

  // Projects
  getProject(id: number, token?: string): Promise<(Project & { client: User }) | undefined>;
  listProjects(filters?: { category?: string; minBudget?: number; maxBudget?: number; search?: string; clientId?: string }, token?: string): Promise<(Project & { client: User })[]>;
  createProject(project: InsertProject, clientId: string, token?: string): Promise<Project>;
  updateProject(id: number, updates: UpdateProjectRequest, token?: string): Promise<Project>;
  deleteProject(id: number, token?: string): Promise<void>;

  // Interests
  createInterest(interest: InsertInterest, developerId: string, token?: string): Promise<ProjectInterest>;
  listInterests(projectId: number, token?: string): Promise<(ProjectInterest & { developer: User })[]>;
  updateInterestStatus(interestId: number, status: "accepted" | "rejected", token?: string): Promise<ProjectInterest>;
  rejectOtherInterests(projectId: number, exceptInterestId: number, token?: string): Promise<void>;

  // Project Assignment
  assignDeveloper(projectId: number, developerId: string, token?: string): Promise<Project>;
  listAssignedProjects(developerId: string, token?: string): Promise<(Project & { client: User })[]>;

  // Project Logs
  listProjectLogs(projectId: number, token?: string): Promise<(ProjectLog & { author: User })[]>;
  createProjectLog(log: InsertProjectLog, authorId: string, token?: string): Promise<ProjectLog>;

  // Messages
  listMessages(projectId: number, userId: string, token?: string): Promise<(Message & { sender: User })[]>;
  listUserConversations(userId: string, token?: string): Promise<any[]>;
  createMessage(message: InsertMessage, senderId: string, token?: string): Promise<Message>;

  // Users
  getUser(id: string, token?: string): Promise<User | undefined>;
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

// Helper to map public.users (snake_case) to User (camelCase)
function mapUser(row: any): User {
  if (!row) return row;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

// Helper to map DB profile to Profile
function mapProfile(row: any): Profile {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    bio: row.bio,
    skills: row.skills,
    portfolioLinks: row.portfolio_links,
    experienceLevel: row.experience_level,
    availabilityStatus: row.availability_status,
    companyName: row.company_name,
    industry: row.industry,
    companySize: row.company_size,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

// Helper to map DB project to Project
function mapProject(row: any): Project {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    assignedDeveloperId: row.assigned_developer_id,
    title: row.title,
    category: row.category,
    description: row.description,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    deadline: row.deadline,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
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
    status: row.status,
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

export class DatabaseStorage implements IStorage {
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
        bio: insertProfile.bio,
        skills: insertProfile.skills,
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
    if (updates.role) payload.role = updates.role;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.skills !== undefined) payload.skills = updates.skills;
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
    const clientUser = mapUser(data.client);
    return { ...project, client: clientUser };
  }

  async listProjects(filters?: { category?: string; minBudget?: number; maxBudget?: number; search?: string; sort?: string; clientId?: string }, token?: string): Promise<(Project & { client: User })[]> {
    const client = await getClient(token);
    let query = client
      .from("projects")
      .select("*, client:client_id(*)")
      .eq("is_deleted", false);

    if (filters?.clientId) {
      query = query.eq("client_id", filters.clientId);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
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
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;

    return ((data as any[]) || []).map(row => ({
      ...mapProject(row),
      client: mapUser(row.client)
    }));
  }

  async createProject(insertProject: InsertProject, clientId: string, token?: string): Promise<Project> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("projects")
      .insert({
        client_id: clientId,
        title: insertProject.title,
        category: insertProject.category,
        description: insertProject.description,
        budget_min: insertProject.budgetMin,
        budget_max: insertProject.budgetMax,
        deadline: insertProject.deadline,
        status: "open"
      })
      .select()
      .single();

    if (error) throw error;
    return mapProject(data);
  }

  async updateProject(id: number, updates: UpdateProjectRequest, token?: string): Promise<Project> {
    const client = await getClient(token);
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.category) payload.category = updates.category;
    if (updates.description) payload.description = updates.description;
    if (updates.budgetMin !== undefined) payload.budget_min = updates.budgetMin;
    if (updates.budgetMax !== undefined) payload.budget_max = updates.budgetMax;
    if (updates.deadline) payload.deadline = updates.deadline;
    if (updates.status) payload.status = updates.status;

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
    const { data, error } = await client
      .from("project_interests")
      .insert({
        project_id: insertInterest.projectId,
        developer_id: developerId,
        message: insertInterest.message,
      })
      .select()
      .single();

    if (error) throw error;
    return mapInterest(data);
  }

  async listInterests(projectId: number, token?: string): Promise<(ProjectInterest & { developer: User })[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("project_interests")
      .select("*, developer:developer_id(*)")
      .eq("project_id", projectId);

    if (error) throw error;
    return ((data as any[]) || []).map(row => ({
      ...mapInterest(row),
      developer: mapUser(row.developer)
    }));
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

  async rejectOtherInterests(projectId: number, exceptInterestId: number, token?: string): Promise<void> {
    const client = await getClient(token);
    const { error } = await client
      .from("project_interests")
      .update({ status: "rejected" })
      .eq("project_id", projectId)
      .eq("status", "pending")
      .neq("id", exceptInterestId);

    if (error) throw error;
  }

  // Project Assignment
  async assignDeveloper(projectId: number, developerId: string, token?: string): Promise<Project> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("projects")
      .update({
        assigned_developer_id: developerId,
        status: "in_progress"
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return mapProject(data);
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
    return ((data as any[]) || []).map(row => ({
      ...mapProject(row),
      client: mapUser(row.client)
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
        content: log.content,
        log_type: log.logType || "update",
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
      .order("created_at", { ascending: false });

    if (error) throw error;

    return ((data as any[]) || []).map(row => ({
      ...mapMessage(row),
      sender: mapUser(row.sender)
    }));
  }

  async listUserConversations(userId: string, token?: string): Promise<any[]> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("messages")
      .select("*, project:project_id(id, title), sender:sender_id(id, first_name, last_name, profile_image_url), receiver:receiver_id(id, first_name, last_name, profile_image_url)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return ((data as any[]) || []).map(row => ({
      id: row.id,
      projectId: row.project_id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      createdAt: row.created_at,
      project: { id: row.project?.id, title: row.project?.title },
      sender: mapUser(row.sender),
      receiver: mapUser(row.receiver),
    }));
  }

  async createMessage(insertMessage: InsertMessage, senderId: string, token?: string): Promise<Message> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("messages")
      .insert({
        project_id: insertMessage.projectId,
        sender_id: senderId,
        receiver_id: insertMessage.receiverId,
        content: insertMessage.content,
      })
      .select()
      .single();

    if (error) throw error;
    return mapMessage(data);
  }

  // Users
  async getUser(id: string, token?: string): Promise<User | undefined> {
    const client = await getClient(token);
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return mapUser(data);
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
    return mapUser(data);
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
      usersQuery = usersQuery.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
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
        ...mapUser(row),
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
    return mapUser(data);
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
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.skills !== undefined) payload.skills = updates.skills;
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

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const items = ((data as any[]) || []).map((row) => ({
      ...mapProject(row),
      client: mapUser(row.client),
    }));

    return { items, total: count || 0 };
  }

  // Admin: Update any project
  async adminUpdateProject(projectId: number, updates: UpdateProjectRequest, token?: string): Promise<Project> {
    const client = await getClient(token);
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.category) payload.category = updates.category;
    if (updates.description) payload.description = updates.description;
    if (updates.budgetMin !== undefined) payload.budget_min = updates.budgetMin;
    if (updates.budgetMax !== undefined) payload.budget_max = updates.budgetMax;
    if (updates.deadline) payload.deadline = updates.deadline;
    if (updates.status) payload.status = updates.status;

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
    ]);

    return {
      totalUsers: usersResult.count || 0,
      totalDevelopers: developersResult.count || 0,
      totalClients: clientsResult.count || 0,
      totalAdmins: adminsResult.count || 0,
      totalProjects: projectsResult.count || 0,
      openProjects: openProjectsResult.count || 0,
      completedProjects: completedProjectsResult.count || 0,
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
