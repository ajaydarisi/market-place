"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@shared/routes";
import { authFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: [api.notifications.list.path],
    queryFn: async () => {
      const res = await authFetch(api.notifications.list.path);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return api.notifications.list.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useNotificationsRealtime(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Unique channel name per subscription so React's dev double-mount (and any
    // remount) can't re-add callbacks to a channel that's still tearing down,
    // which throws "cannot add postgres_changes callbacks after subscribe()".
    const channel = supabase
      .channel(`notifications-realtime-${userId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [api.notifications.list.path] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await authFetch(api.notifications.markAllRead.path, {
        method: api.notifications.markAllRead.method,
      });
      if (!res.ok) throw new Error("Failed to mark notifications read");
      return api.notifications.markAllRead.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notifications.list.path] });
    },
  });
}
