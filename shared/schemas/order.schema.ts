import { z } from "zod";

import { ORDER_STATUSES } from "../types/enums";
import { paginationSchema } from "./common.schema";

export const addressSchema = z.object({
  line1: z.string().min(2, "Address is required"),
  line2: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(7, "Enter a valid phone number"),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const createOrderSchema = z.object({
  shippingAddress: addressSchema,
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const listOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
});
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
