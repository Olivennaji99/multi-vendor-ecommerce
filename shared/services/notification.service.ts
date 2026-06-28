import { Notification } from "../models/Notification.model";
import { buildPaginatedResult, getSkip } from "../lib/pagination";
import type { Actor } from "../types/actor";
import type { NotificationType } from "../types/enums";

export interface CreateNotificationInput {
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  return Notification.create({
    user: input.user,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
    meta: input.meta ?? {},
  });
}

export async function listNotificationsForUser(
  actor: Actor,
  params: { page: number; limit: number; unreadOnly?: boolean }
) {
  const filter: Record<string, unknown> = { user: actor.id };
  if (params.unreadOnly) filter.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: actor.id, isRead: false }),
  ]);

  return { ...buildPaginatedResult(items, total, params.page, params.limit), unreadCount };
}

export async function markNotificationRead(actor: Actor, notificationId: string) {
  await Notification.updateOne({ _id: notificationId, user: actor.id }, { isRead: true });
}

export async function markAllNotificationsRead(actor: Actor) {
  await Notification.updateMany({ user: actor.id, isRead: false }, { isRead: true });
}
