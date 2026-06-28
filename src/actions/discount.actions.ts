"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { createDiscountSchema, type CreateDiscountInput } from "@shared/schemas/discount.schema";
import { createDiscount, deleteDiscount, setDiscountActive } from "@shared/services/discount.service";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function createDiscountAction(input: CreateDiscountInput): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const parsed = createDiscountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the form and try again." };
  }

  try {
    await connectToDatabase();
    await createDiscount({ id: session.user.id, role: session.user.role }, parsed.data);
    revalidatePath("/admin/discounts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not create discount.",
    };
  }
}

export async function setDiscountActiveAction(
  discountId: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  try {
    await connectToDatabase();
    await setDiscountActive({ id: session.user.id, role: session.user.role }, discountId, isActive);
    revalidatePath("/admin/discounts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not update discount.",
    };
  }
}

export async function deleteDiscountAction(discountId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  try {
    await connectToDatabase();
    await deleteDiscount({ id: session.user.id, role: session.user.role }, discountId);
    revalidatePath("/admin/discounts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not delete discount.",
    };
  }
}
