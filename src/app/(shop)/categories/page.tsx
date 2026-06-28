import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { listCategories } from "@shared/services/category.service";

export const metadata: Metadata = { title: "Categories | NovaShop" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await connectToDatabase();
  const categories = await listCategories({ activeOnly: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="flex flex-col gap-2 rounded-xl border p-6 text-center transition-shadow hover:shadow-md"
          >
            <span className="text-base font-medium">{category.name}</span>
            {category.description && (
              <span className="text-sm text-muted-foreground">{category.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
