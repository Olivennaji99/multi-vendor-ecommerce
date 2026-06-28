"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@shared/db/connection";
import { zodIssuesToFieldErrors } from "@shared/lib/zod";
import { createReviewSchema } from "@shared/schemas/review.schema";
import { createReview } from "@shared/services/review.service";

import { auth } from "@/lib/auth";
import { runAction, type ActionResult } from "@/lib/action-helpers";

export async function createReviewAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) {
    return { success: false, formError: "You must be signed in to leave a review." };
  }

  const parsed = createReviewSchema.safeParse({
    product: formData.get("product"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      success: false,
      formError: "Please check your review and try again.",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  }

  const result = await runAction(async () => {
    await connectToDatabase();
    await createReview({ id: session.user.id, role: session.user.role }, parsed.data);
  });

  const productSlug = formData.get("productSlug");
  if (result.success && typeof productSlug === "string") {
    revalidatePath(`/products/${productSlug}`);
  }

  return result;
}
