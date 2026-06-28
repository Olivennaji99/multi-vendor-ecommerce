import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { toProductCardData } from "@shared/lib/product-presentation";
import { listProducts } from "@shared/services/product.service";

import { PaginationControls } from "@/components/storefront/pagination-controls";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata: Metadata = { title: "Search | NovaShop" };
export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams;
  await connectToDatabase();

  const page = Number(pageParam ?? 1);
  const result = q
    ? await listProducts({ search: q, sort: "newest", page, limit: 16 })
    : { items: [], total: 0, page: 1, limit: 16, totalPages: 1 };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {q ? `Search results for "${q}"` : "Search"}
        </h1>
        <p className="text-sm text-muted-foreground">{result.total} products found</p>
      </div>
      <ProductGrid products={result.items.map((product) => toProductCardData(product))} />
      <PaginationControls page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
