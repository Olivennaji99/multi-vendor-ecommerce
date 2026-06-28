import { z } from "zod";

import { objectIdSchema } from "./common.schema";

export const createReviewSchema = z.object({
  product: objectIdSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters").max(1000),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
