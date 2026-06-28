import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@shared/db/connection";
import { NotFoundError } from "@shared/lib/errors";
import { toProductCardData } from "@shared/lib/product-presentation";
import { getCategoryBySlug, listCategories } from "@shared/services/category.service";
import { listProducts } from "@shared/services/product.service";

import { PaginationControls } from "@/components/storefront/pagination-controls";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  try {
    const category = await getCategoryBySlug(slug);
    return { title: `${category.name} | NovaShop` };
  } catch {
    return { title: "Category | NovaShop" };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  await connectToDatabase();

  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const page = Number(search.page ?? 1);
  const [categories, result] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({
      category: category.slug,
      sort: (search.sort as never) ?? "newest",
      minPrice: search.minPrice ? Number(search.minPrice) : undefined,
      maxPrice: search.maxPrice ? Number(search.maxPrice) : undefined,
      page,
      limit: 16,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
        <p className="text-sm text-muted-foreground">{result.total} products found</p>
      </div>
      <ProductFilters
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        hideCategoryFilter
      />
      <ProductGrid products={result.items.map((product) => toProductCardData(product))} />
      <PaginationControls page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
