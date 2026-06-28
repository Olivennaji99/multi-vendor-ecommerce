import { z } from "zod";

import { objectIdSchema, paginationSchema } from "./common.schema";

export const createSellerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  categories: z.array(objectIdSchema).min(1, "Select at least one category"),
  storeName: z.string().min(2, "Store name is required"),
  bio: z.string().optional().default(""),
});
export type CreateSellerInput = z.infer<typeof createSellerSchema>;

export const updateSellerSchema = z.object({
  storeName: z.string().min(2).optional(),
  bio: z.string().optional(),
  phone: z.string().min(7).optional(),
  assignedCategories: z.array(objectIdSchema).min(1).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;

export const listSellersQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});
export type ListSellersQuery = z.infer<typeof listSellersQuerySchema>;
