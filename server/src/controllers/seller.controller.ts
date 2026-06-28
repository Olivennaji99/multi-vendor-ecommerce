import type { Request, Response } from "express";

import {
  createSeller,
  getSellerProfile,
  getTopSellers,
  listSellers,
  updateSeller,
} from "@shared/services/seller.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function create(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const result = await createSeller(req.user, req.body);
  res.status(201).json({
    success: true,
    data: { user: result.user, profile: result.profile, defaultPassword: result.defaultPassword },
  });
}

export async function list(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const result = await listSellers(req.user, req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function getOne(req: Request<{ id: string }>, res: Response) {
  const profile = await getSellerProfile(req.params.id);
  res.json({ success: true, data: profile });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const profile = await updateSeller(req.user, req.params.id, req.body);
  res.json({ success: true, data: profile });
}

export async function top(req: Request, res: Response) {
  const limit = Number(req.query.limit ?? 5);
  const sellers = await getTopSellers(limit);
  res.json({ success: true, data: sellers });
}
