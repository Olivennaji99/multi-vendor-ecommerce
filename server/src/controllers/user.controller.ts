import type { Request, Response } from "express";

import { listUsers, setUserActive, updateOwnProfile } from "@shared/services/user.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const result = await listUsers(req.user, req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function setActive(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const user = await setUserActive(req.user, req.params.id, req.body.isActive);
  res.json({ success: true, data: user });
}

export async function updateMe(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const user = await updateOwnProfile(req.user, req.body);
  res.json({ success: true, data: user });
}
