import type { Request, Response } from "express";

import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@shared/services/notification.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const unreadOnly = req.query.unreadOnly === "true";
  const result = await listNotificationsForUser(req.user, { page, limit, unreadOnly });
  res.json({ success: true, data: result });
}

export async function markRead(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await markNotificationRead(req.user, req.params.id);
  res.json({ success: true, data: { message: "Notification marked as read" } });
}

export async function markAllRead(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await markAllNotificationsRead(req.user);
  res.json({ success: true, data: { message: "All notifications marked as read" } });
}
