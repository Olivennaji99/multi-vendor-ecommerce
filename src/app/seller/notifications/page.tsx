"use client";

import { Check } from "lucide-react";

import { formatDate } from "@shared/lib/format";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";

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

export default function SellerNotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const response = data as NotificationsResponse | undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{response?.unreadCount ?? 0} unread</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
          <Check className="size-4" /> Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !response || response.items.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <ul className="flex flex-col gap-2">
          {response.items.map((notification) => (
            <li
              key={notification._id}
              className={`flex items-start justify-between gap-3 rounded-lg border p-4 ${
                notification.isRead ? "" : "bg-primary/5"
              }`}
            >
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.isRead && (
                <Button size="sm" variant="ghost" onClick={() => markRead.mutate(notification._id)}>
                  Mark read
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
