"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { updateOrderStatusSchema } from "@shared/schemas/order.schema";
import { updateOrderStatus } from "@shared/services/order.service";
import type { OrderStatus } from "@shared/types/enums";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const parsed = updateOrderStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { success: false, formError: "Invalid status." };
  }

  try {
    await connectToDatabase();
    await updateOrderStatus({ id: session.user.id, role: session.user.role }, orderId, parsed.data.status);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not update order.",
    };
  }
}
