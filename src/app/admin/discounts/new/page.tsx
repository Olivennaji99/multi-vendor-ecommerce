import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { listCategories } from "@shared/services/category.service";
import { listProducts } from "@shared/services/product.service";

import { DiscountForm } from "@/components/admin/discount-form";

export const metadata: Metadata = { title: "Add Discount | Admin" };
export const dynamic = "force-dynamic";

export default async function NewDiscountPage() {
  await connectToDatabase();
  const [categories, productsResult] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ activeOnly: false, page: 1, limit: 100, sort: "newest" }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add Discount</h1>
      <div className="max-w-2xl">
        <DiscountForm
          categories={categories.map((category) => ({ id: category._id.toString(), name: category.name }))}
          products={productsResult.items.map((product) => ({ id: product._id.toString(), name: product.name }))}
        />
      </div>
    </div>
  );
}
