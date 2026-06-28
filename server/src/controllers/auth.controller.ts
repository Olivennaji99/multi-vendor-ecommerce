import type { Request, Response } from "express";

import {
  changePassword,
  getAuthenticatedUserById,
  registerCustomer,
  verifyCredentials,
} from "@shared/services/auth.service";
import { UnauthorizedError, ValidationError } from "@shared/lib/errors";

import { signAccessToken } from "../middleware/auth.middleware.js";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await verifyCredentials(email, password);
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const token = signAccessToken({ id: user.id, role: user.role });
  res.json({ success: true, data: { token, user } });
}

export async function register(req: Request, res: Response) {
  const user = await registerCustomer(req.body);
  const token = signAccessToken({ id: user.id, role: user.role });
  res.status(201).json({ success: true, data: { token, user } });
}

export async function changeOwnPassword(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await changePassword(req.user, req.body);
  res.json({ success: true, data: { message: "Password updated" } });
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const user = await getAuthenticatedUserById(req.user.id);
  if (!user) throw new ValidationError("User not found");
  res.json({ success: true, data: user });
}
