import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getAuthenticatedUserById } from "@shared/services/auth.service";
import type { Role } from "@shared/types/enums";

import { env } from "../config/env.js";

interface AccessTokenPayload {
  id: string;
  role: Role;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { message: "Authentication required" } });
    return;
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

    const user = await getAuthenticatedUserById(payload.id);
    if (!user) {
      res.status(401).json({ success: false, error: { message: "Account no longer active" } });
      return;
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: "Invalid or expired token" } });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ success: false, error: { message: "You do not have permission to do this" } });
      return;
    }
    next();
  };
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}
