"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { setUserActive } from "@shared/services/user.service";

import { auth } from "@/lib/auth";
import { runAction, type ActionResult } from "@/lib/action-helpers";

export async function setUserActiveAction(userId: string, isActive: boolean): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const result = await runAction(async () => {
    await connectToDatabase();
    await setUserActive({ id: session.user.id, role: session.user.role }, userId, isActive);
  });

  if (result.success) revalidatePath("/admin/users");
  return result;
}
