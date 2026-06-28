"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FieldGroup>
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
        {state?.formError && (
          <p className="text-sm font-medium text-destructive">{state.formError}</p>
        )}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
        <FieldDescription className="text-center">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
