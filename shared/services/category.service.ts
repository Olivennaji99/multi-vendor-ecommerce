import { Category } from "../models/Category.model";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors";
import { slugify } from "../lib/slugify";
import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";
import type { Actor } from "../types/actor";
import { writeAuditLog } from "./audit.service";

export async function listCategories(params?: { activeOnly?: boolean }) {
  const filter = params?.activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryBySlug(slug: string) {
  const category = await Category.findOne({ slug });
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function createCategory(actor: Actor, input: CreateCategoryInput) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const slug = slugify(input.name);
  const existing = await Category.findOne({ $or: [{ name: input.name }, { slug }] });
  if (existing) throw new ConflictError("A category with this name already exists");

  const category = await Category.create({ ...input, slug });

  await writeAuditLog({
    actor: actor.id,
    action: "CATEGORY_CREATED",
    entityType: "Category",
    entityId: category._id.toString(),
  });

  return category;
}

export async function updateCategory(actor: Actor, categoryId: string, input: UpdateCategoryInput) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const category = await Category.findById(categoryId);
  if (!category) throw new NotFoundError("Category not found");

  Object.assign(category, input);
  if (input.name) category.slug = slugify(input.name);
  await category.save();

  await writeAuditLog({
    actor: actor.id,
    action: "CATEGORY_UPDATED",
    entityType: "Category",
    entityId: category._id.toString(),
  });

  return category;
}

export async function deleteCategory(actor: Actor, categoryId: string) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new NotFoundError("Category not found");

  await writeAuditLog({
    actor: actor.id,
    action: "CATEGORY_DELETED",
    entityType: "Category",
    entityId: categoryId,
  });
}
