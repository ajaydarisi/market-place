"use client";

import { useEffect } from "react";
import { api, buildUrl } from "@shared/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export function useProjectMessages(projectId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { projectId });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!projectId,
  });
}

export function useMessagesRealtime(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Record<string, any>;
          if (msg.sender_id === userId || msg.receiver_id === userId) {
            queryClient.invalidateQueries({
              queryKey: [api.messages.list.path, msg.project_id],
            });
            queryClient.invalidateQueries({
              queryKey: [api.messages.conversations.path],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

export interface Conversation {
  projectId: number;
  projectTitle: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
}

export function useConversations(currentUserId: string) {
  return useQuery({
    queryKey: [api.messages.conversations.path],
    queryFn: async () => {
      const res = await authFetch(api.messages.conversations.path);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const messages: any[] = await res.json();

      const convMap = new Map<string, Conversation>();
      for (const msg of messages) {
        const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
        const key = `${msg.projectId}-${otherUser?.id}`;
        if (!convMap.has(key)) {
          convMap.set(key, {
            projectId: msg.projectId,
            projectTitle: msg.project?.title || "Unknown Project",
            otherUserId: otherUser?.id || "",
            otherUserName: [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(" ") || "User",
            otherUserAvatar: otherUser?.profileImageUrl || null,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
          });
        }
      }

      return Array.from(convMap.values());
    },
    enabled: !!currentUserId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, receiverId, content }: { projectId: number; receiverId: string; content: string }) => {
      const url = buildUrl(api.messages.send.path, { projectId });
      const res = await authFetch(url, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.send.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.messages.conversations.path] });
    },
  });
}
