"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMarkNotificationsRead,
  useNotifications,
  useNotificationsRealtime,
} from "@/hooks/use-notifications";

export function NotificationBell({ userId }: { userId: string }) {
  const { data: notifications } = useNotifications(userId);
  const markRead = useMarkNotificationsRead();
  useNotificationsRealtime(userId);

  const unreadCount = notifications?.filter((notification) => !notification.read).length ?? 0;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unreadCount > 0) markRead.mutate();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
          className="surface-glass relative shrink-0 rounded-full border border-card-border/60"
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span
              data-testid="notification-badge"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!notifications || notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing yet — proposals and messages show up here live.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/projects/${notification.projectId}`}
                className={`block border-b border-border/40 px-3 py-3 text-sm transition-colors last:border-b-0 hover:bg-secondary/50 ${
                  notification.read ? "text-muted-foreground" : "font-medium text-foreground"
                }`}
                data-testid={`notification-item-${notification.id}`}
              >
                <p className="line-clamp-2">{notification.content}</p>
                <p className="mt-1 text-xs font-normal text-muted-foreground">
                  {notification.createdAt
                    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                    : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
