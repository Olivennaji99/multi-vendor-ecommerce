import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { getCustomerProfile } from "@shared/services/customer.service";

import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = { title: "Checkout | NovaShop" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  await connectToDatabase();
  const profile = await getCustomerProfile({ id: session!.user.id, role: session!.user.role });

  const savedAddresses = profile.addresses.map((address) => ({
    id: address._id.toString(),
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutForm savedAddresses={savedAddresses} />
    </div>
  );
}
