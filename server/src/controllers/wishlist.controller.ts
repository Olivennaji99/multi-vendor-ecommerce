import type { Request, Response } from "express";

import { addToWishlist, getWishlist, removeFromWishlist } from "@shared/services/wishlist.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function get(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const wishlist = await getWishlist(req.user);
  res.json({ success: true, data: wishlist });
}

export async function add(req: Request<{ productId: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const wishlist = await addToWishlist(req.user, req.params.productId);
  res.status(201).json({ success: true, data: wishlist });
}

export async function remove(req: Request<{ productId: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const wishlist = await removeFromWishlist(req.user, req.params.productId);
  res.json({ success: true, data: wishlist });
}
