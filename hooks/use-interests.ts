"use client";

import { api, buildUrl } from "@shared/routes";
import type { ProposalScreeningAnswer } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch, apiError } from "@/lib/api";

export function useProjectInterests(projectId: number, sort?: string) {
  return useQuery({
    queryKey: [api.interests.listByProject.path, projectId, sort],
    queryFn: async () => {
      const url = buildUrl(api.interests.listByProject.path, { projectId });
      const requestUrl = new URL(url, window.location.origin);
      if (sort) requestUrl.searchParams.set("sort", sort);
      const res = await authFetch(requestUrl.toString());
      if (!res.ok) throw new Error("Failed to fetch interests");
      return api.interests.listByProject.responses[200].parse(await res.json());
    },
    enabled: !!projectId,
  });
}

export function useExpressInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      message,
      proposedBudget,
      estimatedDurationDays,
      relevantSkills,
      screeningAnswers,
    }: {
      projectId: number;
      message: string;
      proposedBudget?: number;
      estimatedDurationDays?: number;
      relevantSkills?: string[];
      screeningAnswers?: ProposalScreeningAnswer[];
    }) => {
      const url = buildUrl(api.interests.create.path, { projectId });
      const res = await authFetch(url, {
        method: api.interests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, proposedBudget, estimatedDurationDays, relevantSkills, screeningAnswers }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to express interest");
      }
      return api.interests.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.interests.listByProject.path, variables.projectId] });
    },
  });
}

export function useUpdateInterestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      interestId,
      status,
    }: {
      projectId: number;
      interestId: number;
      status: "accepted" | "rejected";
    }) => {
      const url = buildUrl(api.interests.updateStatus.path, { projectId, interestId });
      const res = await authFetch(url, {
        method: api.interests.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw await apiError(res, "Failed to update interest status");
      return api.interests.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.interests.listByProject.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, variables.projectId] });
    },
  });
}

export function useWithdrawInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, interestId }: { projectId: number; interestId: number }) => {
      const url = buildUrl(api.interests.withdraw.path, { projectId, interestId });
      const res = await authFetch(url, { method: api.interests.withdraw.method });
      if (!res.ok) throw await apiError(res, "Failed to withdraw proposal");
      return api.interests.withdraw.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.interests.listByProject.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, variables.projectId] });
    },
  });
}
