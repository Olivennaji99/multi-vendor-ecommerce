"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  items: NotificationItem[];
  unreadCount: number;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const { data } = useNotifications({ enabled: Boolean(session) });
  const markRead = useMarkNotificationRead();
  const response = data as NotificationsResponse | undefined;
  const unreadCount = response?.unreadCount ?? 0;

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-4.5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full bg-brand-red px-1 text-[10px] text-brand-red-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {!response || response.items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          response.items.slice(0, 8).map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className="flex flex-col items-start gap-0.5 whitespace-normal"
              onClick={() => {
                if (!notification.isRead) markRead.mutate(notification._id);
              }}
              render={
                <Link href={notification.link ?? "#"}>
                  <span className="flex items-center gap-2 font-medium">
                    {!notification.isRead && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{notification.message}</span>
                </Link>
              }
            />
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
