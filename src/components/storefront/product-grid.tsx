import Link from "next/link";
import type { ReactNode } from "react";

import type { ProductCardData } from "@shared/lib/product-presentation";

import { EmptyState } from "@/components/states/empty-state";

import { ProductCard } from "./product-card";

export function ProductGrid({
  title,
  viewAllHref,
  products,
  action,
}: {
  title?: string;
  viewAllHref?: string;
  products: ProductCardData[];
  action?: ReactNode;
}) {
  return (
    <section>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {action ?? (
            viewAllHref && (
              <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
                View All
              </Link>
            )
          )}
        </div>
      )}
      {products.length === 0 ? (
        <EmptyState title="No products yet" message="Check back soon for new arrivals." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
