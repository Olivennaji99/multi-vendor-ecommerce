import type { Request, Response } from "express";

import {
  createProduct,
  deleteProduct,
  getLowStockProducts,
  getProductBySlug,
  listProducts,
  listSellerProducts,
  updateProduct,
} from "@shared/services/product.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function list(req: Request, res: Response) {
  const result = await listProducts(req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function getOne(req: Request<{ slug: string }>, res: Response) {
  const product = await getProductBySlug(req.params.slug, { incrementView: true });
  res.json({ success: true, data: product });
}

export async function mine(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const result = await listSellerProducts(req.user, req.validatedQuery as never);
  res.json({ success: true, data: result });
}

export async function lowStock(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const sellerId = req.user.role === "ADMIN" ? undefined : req.user.id;
  const products = await getLowStockProducts(sellerId);
  res.json({ success: true, data: products });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const product = await createProduct(req.user, req.body);
  res.status(201).json({ success: true, data: product });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const product = await updateProduct(req.user, req.params.id, req.body);
  res.json({ success: true, data: product });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await deleteProduct(req.user, req.params.id);
  res.json({ success: true, data: { message: "Product deleted" } });
}
