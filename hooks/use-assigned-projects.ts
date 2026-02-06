"use client";

import { api } from "@shared/routes";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";

export function useAssignedProjects() {
  return useQuery({
    queryKey: [api.developer.assignedProjects.path],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(api.developer.assignedProjects.path, { headers });
      if (!res.ok) throw new Error("Failed to fetch assigned projects");
      return api.developer.assignedProjects.responses[200].parse(await res.json());
    },
  });
}
