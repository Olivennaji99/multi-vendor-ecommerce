import type { Request, Response } from "express";

import {
  createCategory,
  deleteCategory,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from "@shared/services/category.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function list(_req: Request, res: Response) {
  const categories = await listCategories({ activeOnly: true });
  res.json({ success: true, data: categories });
}

export async function getOne(req: Request<{ slug: string }>, res: Response) {
  const category = await getCategoryBySlug(req.params.slug);
  res.json({ success: true, data: category });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const category = await createCategory(req.user, req.body);
  res.status(201).json({ success: true, data: category });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const category = await updateCategory(req.user, req.params.id, req.body);
  res.json({ success: true, data: category });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  await deleteCategory(req.user, req.params.id);
  res.json({ success: true, data: { message: "Category deleted" } });
}
