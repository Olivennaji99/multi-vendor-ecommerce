import { z } from "zod";

import { paginationSchema } from "./common.schema";

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = paginationSchema.extend({
  role: z.string().optional(),
  search: z.string().optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
