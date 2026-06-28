import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { listCategories } from "@shared/services/category.service";

import { SellerForm } from "@/components/admin/seller-form";

export const metadata: Metadata = { title: "Add Seller | Admin" };
export const dynamic = "force-dynamic";

export default async function NewSellerPage() {
  await connectToDatabase();
  const categories = await listCategories({ activeOnly: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Seller</h1>
        <p className="text-sm text-muted-foreground">
          A default password will be generated from the seller&apos;s name. They&apos;ll be
          required to change it on first login.
        </p>
      </div>
      <div className="max-w-2xl">
        <SellerForm categories={categories.map((category) => ({ id: category._id.toString(), name: category.name }))} />
      </div>
    </div>
  );
}
