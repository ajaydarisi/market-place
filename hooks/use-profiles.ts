"use client";

import { api, buildUrl, type UpdateProfileRequest } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";

export function useProfile(userId: string) {
  return useQuery({
    queryKey: [api.profiles.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.profiles.get.path, { userId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.get.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const headers = await getAuthHeaders();
      const res = await fetch(api.profiles.update.path, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to update profile");
      }
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.get.path, data.userId] });
    },
  });
}
