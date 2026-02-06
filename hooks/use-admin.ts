"use client";

import {
  api,
  buildUrl,
  type UpdateProfileRequest,
  type UpdateProjectRequest,
  type UpdateUserRequest,
} from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";

// ==================== STATS ====================

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(api.admin.stats.path, { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch admin stats");
      }
      return api.admin.stats.responses[200].parse(await res.json());
    },
  });
}

// ==================== USERS ====================

export function useAdminUsers(filters?: {
  role?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}) {
  return useQuery({
    queryKey: [api.admin.users.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.admin.users.list.path, window.location.origin);
      if (filters?.role) url.searchParams.set("role", filters.role);
      if (filters?.search) url.searchParams.set("search", filters.search);
      if (filters?.page) url.searchParams.set("page", String(filters.page));
      if (filters?.pageSize) url.searchParams.set("pageSize", String(filters.pageSize));
      if (filters?.includeDeleted) url.searchParams.set("includeDeleted", "true");

      const headers = await getAuthHeaders();
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch users");
      }
      return api.admin.users.list.responses[200].parse(await res.json());
    },
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: [api.admin.users.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.admin.users.get.path, { userId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch user");
      }
      return api.admin.users.get.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserRequest }) => {
      const url = buildUrl(api.admin.users.update.path, { userId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.admin.users.update.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update user");
      }
      return api.admin.users.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.users.get.path, variables.userId] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const url = buildUrl(api.admin.users.delete.path, { userId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.admin.users.delete.method,
        headers,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete user");
      }
      return api.admin.users.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
    },
  });
}

// ==================== PROFILES ====================

export function useAdminProfile(userId: string) {
  return useQuery({
    queryKey: [api.admin.profiles.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.admin.profiles.get.path, { userId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch profile");
      }
      return api.admin.profiles.get.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useAdminUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileRequest }) => {
      const url = buildUrl(api.admin.profiles.update.path, { userId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.admin.profiles.update.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update profile");
      }
      return api.admin.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.users.get.path, variables.userId] });
      queryClient.invalidateQueries({ queryKey: [api.admin.profiles.get.path, variables.userId] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
    },
  });
}

// ==================== PROJECTS ====================

export function useAdminProjects(filters?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}) {
  return useQuery({
    queryKey: [api.admin.projects.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.admin.projects.list.path, window.location.origin);
      if (filters?.status) url.searchParams.set("status", filters.status);
      if (filters?.search) url.searchParams.set("search", filters.search);
      if (filters?.page) url.searchParams.set("page", String(filters.page));
      if (filters?.pageSize) url.searchParams.set("pageSize", String(filters.pageSize));
      if (filters?.includeDeleted) url.searchParams.set("includeDeleted", "true");

      const headers = await getAuthHeaders();
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch projects");
      }
      return api.admin.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useAdminProject(id: number) {
  return useQuery({
    queryKey: [api.admin.projects.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.admin.projects.get.path, { id });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch project");
      }
      return api.admin.projects.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useAdminUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProjectRequest }) => {
      const url = buildUrl(api.admin.projects.update.path, { id });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.admin.projects.update.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update project");
      }
      return api.admin.projects.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.projects.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.projects.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
    },
  });
}

export function useAdminDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.projects.delete.path, { id });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.admin.projects.delete.method,
        headers,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete project");
      }
      return api.admin.projects.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.projects.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
    },
  });
}

// ==================== AUDIT LOGS ====================

export function useAdminAuditLogs(filters?: {
  adminId?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [api.admin.auditLogs.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.admin.auditLogs.list.path, window.location.origin);
      if (filters?.adminId) url.searchParams.set("adminId", filters.adminId);
      if (filters?.action) url.searchParams.set("action", filters.action);
      if (filters?.page) url.searchParams.set("page", String(filters.page));
      if (filters?.pageSize) url.searchParams.set("pageSize", String(filters.pageSize));

      const headers = await getAuthHeaders();
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch audit logs");
      }
      return api.admin.auditLogs.list.responses[200].parse(await res.json());
    },
  });
}
