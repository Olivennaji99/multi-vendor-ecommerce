import type { Request, Response } from "express";

import { createReview, listReviewsForCustomer, listReviewsForProduct } from "@shared/services/review.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function forProduct(req: Request<{ productId: string }>, res: Response) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const result = await listReviewsForProduct(req.params.productId, { page, limit });
  res.json({ success: true, data: result });
}

export async function mine(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const reviews = await listReviewsForCustomer(req.user);
  res.json({ success: true, data: reviews });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const review = await createReview(req.user, req.body);
  res.status(201).json({ success: true, data: review });
}
