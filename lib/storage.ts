import {
  type InsertInterest, type InsertMessage,
  type InsertProfile, type InsertProject,
  type Message,
  type Profile, type Project, type ProjectInterest,
  type UpdateProfileRequest, type UpdateProjectRequest,
  type UpdateUserRequest,
  type User
} from "@shared/schema";
import { createClient as createServerClient, createAuthenticatedClient } from "@/lib/supabase/server";

export interface IStorage {
  // Profiles
  getProfile(userId: string, token?: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile, userId: string, token?: string): Promise<Profile>;
  updateProfile(userId: string, updates: UpdateProfileRequest, token?: string): Promise<Profile>;

  // Projects
  getProject(id: number, token?: string): Promise<(Project & { client: User }) | undefined>;
  listProjects(filters?: { category?: string; minBudget?: number; maxBudget?: number; search?: string }, token?: string): Promise<(Project & { client: User })[]>;
  createProject(project: InsertProject, clientId: string, token?: string): Promise<Project>;
  updateProject(id: number, updates: UpdateProjectRequest, token?: string): Promise<Project>;

  // Interests
  createInterest(interest: InsertInterest, developerId: string, token?: string): Promise<ProjectInterest>;
  listInterests(projectId: number, token?: string): Promise<(ProjectInterest & { developer: User })[]>;

  // Messages
  listMessages(projectId: number, userId: string, token?: string): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage, senderId: string, token?: string): Promise<Message>;

  // Users
  getUser(id: string, token?: string): Promise<User | undefined>;
  updateUser(id: string, updates: UpdateUserRequest, token?: string): Promise<User>;
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
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

// Helper to map DB project to Project
function mapProject(row: any): Project {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
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
        availability_status: insertProfile.availabilityStatus
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
      .single();

    if (error || !data) return undefined;

    const project = mapProject(data);
    const clientUser = mapUser(data.client);
    return { ...project, client: clientUser };
  }

  async listProjects(filters?: { category?: string; minBudget?: number; maxBudget?: number; search?: string }, token?: string): Promise<(Project & { client: User })[]> {
    const client = await getClient(token);
    let query = client
      .from("projects")
      .select("*, client:client_id(*)")
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
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
}

export const storage = new DatabaseStorage();
