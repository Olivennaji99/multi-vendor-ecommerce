import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { listCategories } from "@shared/services/category.service";
import { listSellers } from "@shared/services/seller.service";

import { auth } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Add Product | Admin" };
export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  const session = await auth();
  await connectToDatabase();

  const [categories, sellersResult] = await Promise.all([
    listCategories({ activeOnly: true }),
    listSellers({ id: session!.user.id, role: session!.user.role }, { page: 1, limit: 100 }),
  ]);

  const sellers = sellersResult.items.map((profile) => {
    const doc = profile as unknown as { user: { _id: { toString(): string }; name: string }; storeName: string };
    return { id: doc.user._id.toString(), label: `${doc.storeName} (${doc.user.name})` };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add Product</h1>
      <div className="max-w-2xl">
        <ProductForm
          categories={categories.map((category) => ({ id: category._id.toString(), name: category.name }))}
          sellers={sellers}
        />
      </div>
    </div>
  );
}
