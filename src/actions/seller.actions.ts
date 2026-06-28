"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { createSellerSchema, type CreateSellerInput } from "@shared/schemas/seller.schema";
import { createSeller } from "@shared/services/seller.service";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function createSellerAction(
  input: CreateSellerInput
): Promise<ActionResult<{ defaultPassword: string }>> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const parsed = createSellerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the form and try again." };
  }

  try {
    await connectToDatabase();
    const { defaultPassword } = await createSeller(
      { id: session.user.id, role: session.user.role },
      parsed.data
    );
    revalidatePath("/admin/sellers");
    return { success: true, data: { defaultPassword } };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not create seller.",
    };
  }
}
