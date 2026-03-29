"use client";

import { api, buildUrl } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";

export function useProjectReviews(projectId: number) {
  return useQuery({
    queryKey: [api.reviews.listByProject.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.reviews.listByProject.path, { projectId });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.reviews.listByProject.responses[200].parse(await res.json());
    },
    enabled: !!projectId,
  });
}

export function useCreateProjectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      rating,
      comment,
    }: {
      projectId: number;
      rating: number;
      comment?: string | null;
    }) => {
      const url = buildUrl(api.reviews.create.path, { projectId });
      const res = await authFetch(url, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create review");
      }

      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.reviews.listByProject.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.messages.conversations.path] });
    },
  });
}
