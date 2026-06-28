"use server";

import { connectToDatabase } from "@shared/db/connection";
import { addressSchema, type AddressInput } from "@shared/schemas/order.schema";
import { createOrderFromCart } from "@shared/services/order.service";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function placeOrderAction(input: AddressInput): Promise<ActionResult<{ orderId: string }>> {
  const session = await auth();
  if (!session) return { success: false, formError: "You must be signed in to check out." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check your shipping address and try again." };
  }

  try {
    await connectToDatabase();
    const order = await createOrderFromCart(
      { id: session.user.id, role: session.user.role },
      parsed.data
    );
    return { success: true, data: { orderId: order._id.toString() } };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not place your order.",
    };
  }
}
