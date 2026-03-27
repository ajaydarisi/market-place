"use client";

import { api } from "@shared/routes";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";

export function useAssignedProjects() {
  return useQuery({
    queryKey: [api.developer.assignedProjects.path],
    queryFn: async () => {
      const res = await authFetch(api.developer.assignedProjects.path);
      if (!res.ok) throw new Error("Failed to fetch assigned projects");
      return api.developer.assignedProjects.responses[200].parse(await res.json());
    },
  });
}
