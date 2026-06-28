"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addAddressSchema, type AddAddressInput } from "@shared/schemas/customer.schema";

import { addAddressAction } from "@/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AddressForm() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addAddressSchema),
    defaultValues: {
      label: "Home",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
    },
  });

  async function onSubmit(data: AddAddressInput) {
    const result = await addAddressAction(data);
    if (!result.success) {
      toast.error(result.formError ?? "Could not add address");
      return;
    }
    toast.success("Address added");
    reset();
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Add new address
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="label">Label</FieldLabel>
          <Input id="label" {...register("label")} placeholder="Home, Office..." />
        </Field>
        <Field>
          <FieldLabel htmlFor="line1">Address line 1</FieldLabel>
          <Input id="line1" {...register("line1")} />
          <FieldError errors={errors.line1 ? [errors.line1] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="line2">Address line 2 (optional)</FieldLabel>
          <Input id="line2" {...register("line2")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" {...register("city")} />
            <FieldError errors={errors.city ? [errors.city] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input id="state" {...register("state")} />
            <FieldError errors={errors.state ? [errors.state] : undefined} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
            <Input id="postalCode" {...register("postalCode")} />
            <FieldError errors={errors.postalCode ? [errors.postalCode] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" {...register("country")} />
            <FieldError errors={errors.country ? [errors.country] : undefined} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" {...register("phone")} />
          <FieldError errors={errors.phone ? [errors.phone] : undefined} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save address"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
