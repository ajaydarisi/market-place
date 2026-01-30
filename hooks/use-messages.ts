"use client";

import { api, buildUrl } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";

export function useProjectMessages(projectId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { projectId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!projectId,
    refetchInterval: 5000, // Poll for new messages every 5s
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, receiverId, content }: { projectId: number; receiverId: string; content: string }) => {
      const url = buildUrl(api.messages.send.path, { projectId });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ receiverId, content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.send.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, variables.projectId] });
    },
  });
}
