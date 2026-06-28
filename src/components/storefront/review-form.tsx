"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useActionState } from "react";

import { createReviewAction } from "@/actions/review.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const { data: session } = useSession();
  const [state, formAction, isPending] = useActionState(createReviewAction, undefined);

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>{" "}
        to leave a review.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="product" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="rating">Rating</FieldLabel>
          <select
            id="rating"
            name="rating"
            defaultValue="5"
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <FieldError errors={state?.fieldErrors?.rating?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="comment">Your review</FieldLabel>
          <Textarea
            id="comment"
            name="comment"
            placeholder="Share your thoughts about this product"
            required
          />
          <FieldError errors={state?.fieldErrors?.comment?.map((message) => ({ message }))} />
        </Field>
        {state?.formError && (
          <p className="text-sm font-medium text-destructive">{state.formError}</p>
        )}
        {state?.success && (
          <p className="text-sm font-medium text-success">Thanks for your review!</p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit review"}
        </Button>
      </FieldGroup>
    </form>
  );
}
