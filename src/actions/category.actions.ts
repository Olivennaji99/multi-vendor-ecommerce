"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { createCategorySchema, type CreateCategoryInput } from "@shared/schemas/category.schema";
import { createCategory, deleteCategory } from "@shared/services/category.service";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function createCategoryAction(input: CreateCategoryInput): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the form and try again." };
  }

  try {
    await connectToDatabase();
    await createCategory({ id: session.user.id, role: session.user.role }, parsed.data);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not create category.",
    };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  try {
    await connectToDatabase();
    await deleteCategory({ id: session.user.id, role: session.user.role }, categoryId);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not delete category.",
    };
  }
}
