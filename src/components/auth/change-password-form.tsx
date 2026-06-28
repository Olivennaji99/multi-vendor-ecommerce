"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
          <Input id="currentPassword" name="currentPassword" type="password" required />
          <FieldError
            errors={state?.fieldErrors?.currentPassword?.map((message) => ({ message }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <Input id="newPassword" name="newPassword" type="password" required />
          <FieldError errors={state?.fieldErrors?.newPassword?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
          <FieldError
            errors={state?.fieldErrors?.confirmPassword?.map((message) => ({ message }))}
          />
        </Field>
        {state?.formError && (
          <p className="text-sm font-medium text-destructive">{state.formError}</p>
        )}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </FieldGroup>
    </form>
  );
}
