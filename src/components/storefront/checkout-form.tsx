"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { formatCurrency } from "@shared/lib/format";
import { addressSchema, type AddressInput } from "@shared/schemas/order.schema";

import { placeOrderAction } from "@/actions/checkout.actions";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";

interface SavedAddress extends AddressInput {
  id: string;
  label: string;
  isDefault: boolean;
}

interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
}

interface CartResponse {
  items: { _id: string }[];
  totals: CartTotals;
}

export function CheckoutForm({ savedAddresses }: { savedAddresses: SavedAddress[] }) {
  const router = useRouter();
  const { data, isLoading } = useCart();
  const cart = data as CartResponse | undefined;
  const defaultAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      line1: defaultAddress?.line1 ?? "",
      line2: defaultAddress?.line2 ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
      postalCode: defaultAddress?.postalCode ?? "",
      country: defaultAddress?.country ?? "",
      phone: defaultAddress?.phone ?? "",
    },
  });

  async function onSubmit(data: AddressInput) {
    const result = await placeOrderAction(data);
    if (!result.success) {
      toast.error(result.formError ?? "Could not place your order");
      return;
    }
    toast.success("Order placed!");
    router.push(`/checkout/confirmation/${result.data?.orderId}`);
  }

  if (isLoading) return <LoadingState rows={3} />;

  if (!cart || cart.items.length === 0) {
    return <EmptyState title="Your cart is empty" message="Add items to your cart before checking out." />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 lg:col-span-2">
        <h2 className="font-semibold">Shipping Address</h2>
        <FieldGroup>
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
        </FieldGroup>
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Placing order..." : `Place order (${formatCurrency(cart.totals.total)})`}
        </Button>
      </form>

      <Card className="h-fit">
        <CardContent className="flex flex-col gap-3 p-6">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(cart.totals.subtotal)}</span>
          </div>
          {cart.totals.discountTotal > 0 && (
            <div className="flex justify-between text-sm text-brand-red">
              <span>Discount</span>
              <span>-{formatCurrency(cart.totals.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(cart.totals.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(cart.totals.total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Payment is simulated for this demo - no real charge will be made.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
