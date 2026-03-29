"use client";

import { useEffect } from "react";
import { api, buildUrl, type ConversationSummary } from "@shared/routes";
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

export interface Conversation extends ConversationSummary {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessageAt: string;
}

export function useConversations(currentUserId: string) {
  return useQuery({
    queryKey: [api.messages.conversations.path],
    queryFn: async () => {
      const res = await authFetch(api.messages.conversations.path);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const conversations = api.messages.conversations.responses[200].parse(await res.json());
      return conversations.map((conversation) => ({
        ...conversation,
        otherUserId: conversation.otherUser.id,
        otherUserName:
          [conversation.otherUser.firstName, conversation.otherUser.lastName]
            .filter(Boolean)
            .join(" ") || "User",
        otherUserAvatar: conversation.otherUser.profileImageUrl || null,
        lastMessageAt: String(conversation.lastActivityAt),
      }));
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

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      const url = buildUrl(api.messages.markRead.path, { projectId });
      const res = await authFetch(url, {
        method: api.messages.markRead.method,
      });
      if (!res.ok) throw new Error("Failed to mark messages as read");
      return api.messages.markRead.responses[200].parse(await res.json());
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, projectId] });
      queryClient.invalidateQueries({ queryKey: [api.messages.conversations.path] });
    },
  });
}
