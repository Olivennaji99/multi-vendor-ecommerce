import type { Request, Response } from "express";

import {
  createDiscount,
  deleteDiscount,
  listDiscounts,
  setDiscountActive,
} from "@shared/services/discount.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const discounts = await listDiscounts(req.user);
  res.json({ success: true, data: discounts });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const discount = await createDiscount(req.user, req.body);
  res.status(201).json({ success: true, data: discount });
}

export async function setActive(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const discount = await setDiscountActive(req.user, req.params.id, req.body.isActive);
  res.json({ success: true, data: discount });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await deleteDiscount(req.user, req.params.id);
  res.json({ success: true, data: { message: "Discount deleted" } });
}
