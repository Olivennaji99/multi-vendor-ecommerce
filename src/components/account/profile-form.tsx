"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateUserSchema, type UpdateUserInput } from "@shared/schemas/user.schema";

import { updateProfileAction } from "@/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name },
  });

  async function onSubmit(data: UpdateUserInput) {
    const result = await updateProfileAction(data);
    if (!result.success) {
      toast.error(result.formError ?? "Could not update profile");
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={email} disabled />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
