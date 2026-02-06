"use client";

import { api, buildUrl } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";

export function useProjectLogs(projectId: number) {
  return useQuery({
    queryKey: [api.projectLogs.list.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.projectLogs.list.path, { projectId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch project logs");
      return api.projectLogs.list.responses[200].parse(await res.json());
    },
    enabled: !!projectId,
  });
}

export function useCreateProjectLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      content,
      logType,
    }: {
      projectId: number;
      content: string;
      logType?: "update" | "milestone" | "blocker" | "completed";
    }) => {
      const url = buildUrl(api.projectLogs.create.path, { projectId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.projectLogs.create.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ content, logType: logType || "update" }),
      });
      if (!res.ok) throw new Error("Failed to create project log");
      return api.projectLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.projectLogs.list.path, variables.projectId] });
    },
  });
}
