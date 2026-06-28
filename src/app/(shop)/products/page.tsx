import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { toProductCardData } from "@shared/lib/product-presentation";
import { listCategories } from "@shared/services/category.service";
import { listProducts } from "@shared/services/product.service";

import { PaginationControls } from "@/components/storefront/pagination-controls";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata: Metadata = { title: "Shop All Products | NovaShop" };
export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  await connectToDatabase();

  const page = Number(params.page ?? 1);
  const limit = 16;

  const [categories, result] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({
      category: params.category,
      search: params.search,
      brand: params.brand,
      onSale: params.onSale === "true",
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: (params.sort as never) ?? "newest",
      page,
      limit,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shop All Products</h1>
        <p className="text-sm text-muted-foreground">{result.total} products found</p>
      </div>
      <ProductFilters
        categories={categories.map((category) => ({ name: category.name, slug: category.slug }))}
      />
      <ProductGrid products={result.items.map((product) => toProductCardData(product))} />
      <PaginationControls page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
