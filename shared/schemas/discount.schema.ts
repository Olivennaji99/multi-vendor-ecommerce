import { z } from "zod";

import { DISCOUNT_APPLIES_TO, DISCOUNT_TYPES } from "../types/enums";
import { objectIdSchema } from "./common.schema";

export const createDiscountSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    type: z.enum(DISCOUNT_TYPES),
    value: z.coerce.number().positive("Value must be greater than 0"),
    appliesTo: z.enum(DISCOUNT_APPLIES_TO),
    products: z.array(objectIdSchema).optional().default([]),
    categories: z.array(objectIdSchema).optional().default([]),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isFlashSale: z.boolean().optional().default(false),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "End date must be after the start date",
    path: ["endsAt"],
  })
  .refine(
    (data) => (data.appliesTo === "PRODUCT" ? data.products.length > 0 : data.categories.length > 0),
    { message: "Select at least one target", path: ["products"] }
  );
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
