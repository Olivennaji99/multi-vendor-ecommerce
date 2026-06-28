import type { Request, Response } from "express";

import {
  createOrderFromCart,
  getOrderById,
  getOrderHistory,
  listOrderItemsForSeller,
  listOrdersForAdmin,
  updateOrderStatus,
} from "@shared/services/order.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function create(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const order = await createOrderFromCart(req.user, req.body.shippingAddress);
  res.status(201).json({ success: true, data: order });
}

export async function history(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const result = await getOrderHistory(req.user, req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function getOne(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const order = await getOrderById(req.user, req.params.id);
  res.json({ success: true, data: order });
}

export async function adminList(req: Request, res: Response) {
  const result = await listOrdersForAdmin(req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function sellerMine(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const result = await listOrderItemsForSeller(req.user, req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function updateStatus(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const order = await updateOrderStatus(req.user, req.params.id, req.body.status);
  res.json({ success: true, data: order });
}
