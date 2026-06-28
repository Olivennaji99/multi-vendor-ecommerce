import { Ticket } from "lucide-react";
import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { getCustomerProfile } from "@shared/services/customer.service";

import { auth } from "@/lib/auth";
import { AddressForm } from "@/components/account/address-form";
import { AddressList } from "@/components/account/address-list";
import { EmptyState } from "@/components/states/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "My Account | NovaShop" };
export const dynamic = "force-dynamic";

interface AccountPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { tab } = await searchParams;
  const session = await auth();
  await connectToDatabase();
  const profile = await getCustomerProfile({ id: session!.user.id, role: session!.user.role });

  const addresses = profile.addresses.map((address) => ({
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
      <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>

      <Tabs defaultValue={tab === "coupons" ? "coupons" : "addresses"}>
        <TabsList>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="addresses" className="flex flex-col gap-4 pt-4">
          <AddressList addresses={addresses} />
          <AddressForm />
        </TabsContent>
        <TabsContent value="coupons" className="pt-4">
          <EmptyState
            icon={Ticket}
            title="No coupons yet"
            message="Discounts on NovaShop apply automatically at checkout - no code needed."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
