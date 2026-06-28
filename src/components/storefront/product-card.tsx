import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@shared/lib/format";
import type { ProductCardData } from "@shared/lib/product-presentation";

import { Badge } from "@/components/ui/badge";

import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 z-10 bg-brand-red text-brand-red-foreground">
            -{product.discountPercentage}%
          </Badge>
        )}
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 220px, 45vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <WishlistButton productId={product.id} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category && (
          <span className="text-xs text-muted-foreground">{product.category.name}</span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-1 text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-warning text-warning" />
          {product.ratingAverage.toFixed(1)} ({product.ratingCount})
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold">{formatCurrency(product.discountedPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        <div className="mt-2">
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
