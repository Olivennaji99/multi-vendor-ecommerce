import { z } from "zod";

import { addressSchema } from "./order.schema";

export const addAddressSchema = addressSchema.extend({
  label: z.string().min(1).optional().default("Home"),
});
export type AddAddressInput = z.infer<typeof addAddressSchema>;
