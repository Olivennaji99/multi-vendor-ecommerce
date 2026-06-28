"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@shared/schemas/product.schema";
import { createProduct, deleteProduct, updateProduct } from "@shared/services/product.service";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

function canManageProducts(role: string): boolean {
  return role === "ADMIN" || role === "SELLER";
}

export async function createProductAction(input: CreateProductInput): Promise<ActionResult> {
  const session = await auth();
  if (!session || !canManageProducts(session.user.role)) {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the form and try again." };
  }

  try {
    await connectToDatabase();
    await createProduct({ id: session.user.id, role: session.user.role }, parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not create product.",
    };
  }
}

export async function updateProductAction(
  productId: string,
  input: UpdateProductInput
): Promise<ActionResult> {
  const session = await auth();
  if (!session || !canManageProducts(session.user.role)) {
    return { success: false, formError: "You do not have permission to do this." };
  }

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the form and try again." };
  }

  try {
    await connectToDatabase();
    await updateProduct({ id: session.user.id, role: session.user.role }, productId, parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not update product.",
    };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || !canManageProducts(session.user.role)) {
    return { success: false, formError: "You do not have permission to do this." };
  }

  try {
    await connectToDatabase();
    await deleteProduct({ id: session.user.id, role: session.user.role }, productId);
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not delete product.",
    };
  }
}

export async function toggleProductFlagAction(
  productId: string,
  flag: "isFeatured" | "isTrending" | "isRecommended",
  value: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, formError: "You do not have permission to do this." };
  }

  try {
    await connectToDatabase();
    await updateProduct({ id: session.user.id, role: session.user.role }, productId, {
      [flag]: value,
    });
    revalidatePath("/admin/homepage-curation");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not update product.",
    };
  }
}
