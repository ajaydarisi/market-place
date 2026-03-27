"use client";

import { api, buildUrl } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";

export function useProjectInterests(projectId: number) {
  return useQuery({
    queryKey: [api.interests.listByProject.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.interests.listByProject.path, { projectId });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch interests");
      return api.interests.listByProject.responses[200].parse(await res.json());
    },
    enabled: !!projectId,
  });
}

export function useExpressInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, message }: { projectId: number; message: string }) => {
      const url = buildUrl(api.interests.create.path, { projectId });
      const res = await authFetch(url, {
        method: api.interests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to express interest");
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
      if (!res.ok) throw new Error("Failed to update interest status");
      return api.interests.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.interests.listByProject.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, variables.projectId] });
    },
  });
}
