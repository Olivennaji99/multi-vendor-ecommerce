import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().default(""),
  icon: z.string().optional().default("package"),
  imageUrl: z.string().url().nullable().optional(),
  parent: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
