import type { Request, Response } from "express";

import {
  addToCart,
  clearCart,
  computeCartTotals,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@shared/services/cart.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function get(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const { items } = await getCart(req.user);
  const totals = await computeCartTotals(req.user);
  res.json({ success: true, data: { items, totals } });
}

export async function add(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const item = await addToCart(req.user, req.body.product, req.body.quantity);
  res.status(201).json({ success: true, data: item });
}

export async function updateQuantity(req: Request<{ itemId: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const item = await updateCartItemQuantity(req.user, req.params.itemId, req.body.quantity);
  res.json({ success: true, data: item });
}

export async function remove(req: Request<{ itemId: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await removeCartItem(req.user, req.params.itemId);
  res.json({ success: true, data: { message: "Item removed" } });
}

export async function clear(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await clearCart(req.user);
  res.json({ success: true, data: { message: "Cart cleared" } });
}
