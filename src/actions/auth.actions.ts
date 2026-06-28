"use server";

import { AuthError } from "next-auth";

import { connectToDatabase } from "@shared/db/connection";
import {
  changePassword as changePasswordService,
  registerCustomer,
} from "@shared/services/auth.service";
import {
  changePasswordSchema,
  loginSchema,
  registerCustomerSchema,
} from "@shared/schemas/auth.schema";
import { zodIssuesToFieldErrors } from "@shared/lib/zod";

import { auth, signIn, signOut } from "@/lib/auth";
import { type ActionResult } from "@/lib/action-helpers";

export async function loginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      formError: "Please check your details and try again.",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: callbackUrl });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, formError: "Invalid email or password" };
    }
    throw error;
  }
}

export async function registerAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerCustomerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      formError: "Please check your details and try again.",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  }

  try {
    await connectToDatabase();
    await registerCustomer(parsed.data);
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not create your account.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, formError: "Account created. Please sign in." };
    }
    throw error;
  }
}

export async function changePasswordAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) {
    return { success: false, formError: "You must be signed in to do this." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      formError: "Please check your details and try again.",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  }

  try {
    await connectToDatabase();
    await changePasswordService({ id: session.user.id }, parsed.data);
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : "Could not change your password.",
    };
  }

  await signOut({ redirectTo: "/login" });
  return { success: true };
}
