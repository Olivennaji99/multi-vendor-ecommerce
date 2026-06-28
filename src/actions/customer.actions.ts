"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { addAddressSchema, type AddAddressInput } from "@shared/schemas/customer.schema";
import { addAddress, removeAddress, setDefaultAddress } from "@shared/services/customer.service";
import { updateUserSchema, type UpdateUserInput } from "@shared/schemas/user.schema";
import { updateOwnProfile } from "@shared/services/user.service";

import { auth } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function addAddressAction(input: AddAddressInput): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, formError: "You must be signed in to do this." };

  const parsed = addAddressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the address and try again." };
  }

  try {
    await connectToDatabase();
    await addAddress({ id: session.user.id, role: session.user.role }, parsed.data);
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not add address.",
    };
  }
}

export async function removeAddressAction(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, formError: "You must be signed in to do this." };

  try {
    await connectToDatabase();
    await removeAddress({ id: session.user.id, role: session.user.role }, addressId);
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not remove address.",
    };
  }
}

export async function setDefaultAddressAction(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, formError: "You must be signed in to do this." };

  try {
    await connectToDatabase();
    await setDefaultAddress({ id: session.user.id, role: session.user.role }, addressId);
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not update address.",
    };
  }
}

export async function updateProfileAction(input: UpdateUserInput): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, formError: "You must be signed in to do this." };

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, formError: "Please check the form and try again." };
  }

  try {
    await connectToDatabase();
    await updateOwnProfile({ id: session.user.id, role: session.user.role }, parsed.data);
    revalidatePath("/account/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not update profile.",
    };
  }
}
