"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createSellerSchema, type CreateSellerInput } from "@shared/schemas/seller.schema";

import { createSellerAction } from "@/actions/seller.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CategoryOption {
  id: string;
  name: string;
}

export function SellerForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSellerSchema),
    defaultValues: { categories: [] as string[], bio: "", firstName: "", lastName: "", email: "", phone: "", storeName: "" },
  });

  const selectedCategories = watch("categories");

  function toggleCategory(id: string, checked: boolean) {
    const next = checked
      ? [...selectedCategories, id]
      : selectedCategories.filter((categoryId) => categoryId !== id);
    setValue("categories", next, { shouldValidate: true });
  }

  async function onSubmit(data: CreateSellerInput) {
    const result = await createSellerAction(data);
    if (!result.success) {
      toast.error(result.formError ?? "Could not create seller");
      return;
    }
    setCreatedPassword(result.data?.defaultPassword ?? null);
    toast.success("Seller created");
  }

  if (createdPassword) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border p-6">
        <p className="font-medium">Seller account created successfully.</p>
        <p className="text-sm text-muted-foreground">
          Share this default password with the seller. They will be required to change it on
          first login.
        </p>
        <p className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{createdPassword}</p>
        <Button onClick={() => router.push("/admin/sellers")}>Back to Sellers</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" {...register("firstName")} />
            <FieldError errors={errors.firstName ? [errors.firstName] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" {...register("lastName")} />
            <FieldError errors={errors.lastName ? [errors.lastName] : undefined} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" {...register("phone")} />
          <FieldError errors={errors.phone ? [errors.phone] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="storeName">Store name</FieldLabel>
          <Input id="storeName" {...register("storeName")} />
          <FieldError errors={errors.storeName ? [errors.storeName] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="bio">Bio (optional)</FieldLabel>
          <Textarea id="bio" {...register("bio")} />
        </Field>
        <Field>
          <FieldLabel>Categories</FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => toggleCategory(category.id, checked)}
                />
                {category.name}
              </label>
            ))}
          </div>
          <FieldError errors={errors.categories ? [errors.categories] : undefined} />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create seller"}
        </Button>
      </FieldGroup>
    </form>
  );
}
