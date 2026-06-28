import { z } from "zod";

import { objectIdSchema } from "./common.schema";

export const productImageInputSchema = z.object({
  url: z.string().min(1),
  altText: z.string().optional().default(""),
  isPrimary: z.boolean().optional().default(false),
});
export type ProductImageInput = z.infer<typeof productImageInputSchema>;

export const createProductSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description should be at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  category: objectIdSchema,
  brand: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(productImageInputSchema).min(1, "Add at least one image"),
  isFeatured: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isRecommended: z.boolean().optional().default(false),
  seller: objectIdSchema.optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  brand: z.string().optional(),
  onSale: z.coerce.boolean().optional(),
  sort: z
    .enum(["newest", "price-asc", "price-desc", "rating", "popular"])
    .optional()
    .default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
