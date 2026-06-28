import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
