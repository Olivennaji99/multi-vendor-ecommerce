"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" name="name" placeholder="Alina Putri" required />
          <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          <FieldError errors={state?.fieldErrors?.email?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required />
          <FieldError errors={state?.fieldErrors?.password?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
          <FieldError
            errors={state?.fieldErrors?.confirmPassword?.map((message) => ({ message }))}
          />
        </Field>
        {state?.formError && (
          <p className="text-sm font-medium text-destructive">{state.formError}</p>
        )}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating account..." : "Create account"}
        </Button>
        <FieldDescription className="text-center">
          Already have an account? <Link href="/login">Sign in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
