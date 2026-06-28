"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCategorySchema, type CreateCategoryInput } from "@shared/schemas/category.schema";

import { createCategoryAction } from "@/actions/category.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CategoryForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", description: "", icon: "package", sortOrder: 0 },
  });

  async function onSubmit(data: CreateCategoryInput) {
    const result = await createCategoryAction(data);
    if (!result.success) {
      toast.error(result.formError ?? "Could not create category");
      return;
    }
    toast.success("Category created");
    router.push("/admin/categories");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea id="description" {...register("description")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="icon">Icon key</FieldLabel>
          <Input id="icon" {...register("icon")} placeholder="e.g. fashion, beauty, electronics" />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create category"}
        </Button>
      </FieldGroup>
    </form>
  );
}
