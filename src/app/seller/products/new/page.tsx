import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { getSellerProfile } from "@shared/services/seller.service";

import { auth } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Add Product | Seller" };
export const dynamic = "force-dynamic";

export default async function NewSellerProductPage() {
  const session = await auth();
  await connectToDatabase();
  const profile = await getSellerProfile(session!.user.id);
  const categories = profile.assignedCategories as unknown as { _id: { toString(): string }; name: string }[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add Product</h1>
      <div className="max-w-2xl">
        <ProductForm categories={categories.map((category) => ({ id: category._id.toString(), name: category.name }))} />
      </div>
    </div>
  );
}
