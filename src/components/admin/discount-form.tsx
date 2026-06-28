"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createDiscountSchema, type CreateDiscountInput } from "@shared/schemas/discount.schema";

import { createDiscountAction } from "@/actions/discount.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TargetOption {
  id: string;
  name: string;
}

export function DiscountForm({
  products,
  categories,
}: {
  products: TargetOption[];
  categories: TargetOption[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createDiscountSchema),
    defaultValues: {
      name: "",
      type: "PERCENTAGE" as const,
      value: 10,
      appliesTo: "CATEGORY" as const,
      products: [] as string[],
      categories: [] as string[],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isFlashSale: false,
    },
  });

  const appliesTo = watch("appliesTo");
  const selectedProducts = watch("products") ?? [];
  const selectedCategories = watch("categories") ?? [];

  function toggleTarget(field: "products" | "categories", id: string, checked: boolean) {
    const current = field === "products" ? selectedProducts : selectedCategories;
    const next = checked ? [...current, id] : current.filter((targetId) => targetId !== id);
    setValue(field, next, { shouldValidate: true });
  }

  function toDateTimeLocal(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  async function onSubmit(data: CreateDiscountInput) {
    const result = await createDiscountAction(data);
    if (!result.success) {
      toast.error(result.formError ?? "Could not create discount");
      return;
    }
    toast.success("Discount created");
    router.push("/admin/discounts");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" {...register("name")} placeholder="e.g. Summer Flash Sale" />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Discount type</FieldLabel>
            <Select
              value={watch("type")}
              onValueChange={(value) => value && setValue("type", value as "PERCENTAGE" | "FIXED")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="value">Value</FieldLabel>
            <Input id="value" type="number" step="0.01" {...register("value")} />
            <FieldError errors={errors.value ? [errors.value] : undefined} />
          </Field>
        </div>
        <Field>
          <FieldLabel>Applies to</FieldLabel>
          <Select
            value={appliesTo}
            onValueChange={(value) => value && setValue("appliesTo", value as "PRODUCT" | "CATEGORY")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CATEGORY">Categories</SelectItem>
              <SelectItem value="PRODUCT">Specific products</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {appliesTo === "CATEGORY" ? (
          <Field>
            <FieldLabel>Categories</FieldLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => toggleTarget("categories", category.id, checked)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
            <FieldError errors={errors.categories ? [errors.categories] : undefined} />
          </Field>
        ) : (
          <Field>
            <FieldLabel>Products</FieldLabel>
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => toggleTarget("products", product.id, checked)}
                  />
                  {product.name}
                </label>
              ))}
            </div>
            <FieldError errors={errors.products ? [errors.products] : undefined} />
          </Field>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="startsAt">Starts at</FieldLabel>
            <Input
              id="startsAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(new Date())}
              onChange={(event) => setValue("startsAt", new Date(event.target.value))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="endsAt">Ends at</FieldLabel>
            <Input
              id="endsAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
              onChange={(event) => setValue("endsAt", new Date(event.target.value))}
            />
            <FieldError errors={errors.endsAt ? [errors.endsAt] : undefined} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={watch("isFlashSale")}
            onCheckedChange={(checked) => setValue("isFlashSale", checked)}
          />
          Show as a Flash Sale on the homepage
        </label>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create discount"}
        </Button>
      </FieldGroup>
    </form>
  );
}
