import { z } from "zod";

import { objectIdSchema } from "./common.schema";

export const addToCartSchema = z.object({
  product: objectIdSchema,
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});
export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
