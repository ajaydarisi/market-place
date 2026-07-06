"use client";

import { api, buildUrl, type InsertProject, type UpdateProjectRequest } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch, apiError } from "@/lib/api";

// List projects with optional filters
export function useProjects(filters?: {
  category?: string;
  search?: string;
  sort?: string;
  clientId?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  requiredSkills?: string[];
  technologyTags?: string[];
  preferredExperienceLevel?: string;
  projectType?: string;
  scopeSize?: string;
  teamPreference?: string;
}) {
  return useQuery({
    queryKey: [api.projects.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.projects.list.path, window.location.origin);
      if (filters?.category) url.searchParams.set("category", filters.category);
      if (filters?.search) url.searchParams.set("search", filters.search);
      if (filters?.sort) url.searchParams.set("sort", filters.sort);
      if (filters?.clientId) url.searchParams.set("clientId", filters.clientId);
      if (filters?.status) url.searchParams.set("status", filters.status);
      if (filters?.minBudget !== undefined) url.searchParams.set("minBudget", String(filters.minBudget));
      if (filters?.maxBudget !== undefined) url.searchParams.set("maxBudget", String(filters.maxBudget));
      if (filters?.preferredExperienceLevel) {
        url.searchParams.set("preferredExperienceLevel", filters.preferredExperienceLevel);
      }
      if (filters?.requiredSkills && filters.requiredSkills.length > 0) {
        url.searchParams.set("requiredSkills", filters.requiredSkills.join(","));
      }
      if (filters?.technologyTags && filters.technologyTags.length > 0) {
        url.searchParams.set("technologyTags", filters.technologyTags.join(","));
      }
      if (filters?.projectType) url.searchParams.set("projectType", filters.projectType);
      if (filters?.scopeSize) url.searchParams.set("scopeSize", filters.scopeSize);
      if (filters?.teamPreference) url.searchParams.set("teamPreference", filters.teamPreference);

      const res = await authFetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch projects");
      return api.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [api.projects.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.projects.get.path, { id });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch project");
      return api.projects.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await authFetch(api.projects.create.path, {
        method: api.projects.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await apiError(res, "Failed to create project");
      return api.projects.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
    },
  });
}

export function useGenerateProjectDraft() {
  return useMutation({
    mutationFn: async (rawBrief: string) => {
      const res = await authFetch(api.projects.draft.path, {
        method: api.projects.draft.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawBrief }),
      });
      if (!res.ok) throw new Error("Failed to generate project draft");
      return api.projects.draft.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProjectRequest }) => {
      const url = buildUrl(api.projects.update.path, { id });
      const res = await authFetch(url, {
        method: api.projects.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await apiError(res, "Failed to update project");
      return api.projects.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, variables.id] });
    },
  });
}

export function useRequestCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: number) => {
      const url = buildUrl(api.projects.requestCompletion.path, { id: projectId });
      const res = await authFetch(url, { method: api.projects.requestCompletion.method });
      if (!res.ok) throw await apiError(res, "Failed to request completion");
      return api.projects.requestCompletion.responses[200].parse(await res.json());
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.projects.delete.path, { id });
      const res = await authFetch(url, {
        method: api.projects.delete.method,
      });
      if (!res.ok) throw await apiError(res, "Failed to delete project");
      return api.projects.delete.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [api.projects.list.path] });
      queryClient.removeQueries({ queryKey: [api.projects.get.path, id] });
    },
  });
}
