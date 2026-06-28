"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";

interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  ratingAverage: number;
  ratingCount: number;
  stock: number;
  images: { url: string; altText: string }[];
  category: { name: string; slug: string } | null;
  discount: { type: "PERCENTAGE" | "FIXED"; value: number } | null;
}

interface WishlistResponse {
  products: WishlistProduct[];
}

function computeDisplayPrice(product: WishlistProduct) {
  if (!product.discount) return { discountedPrice: product.price, discountPercentage: 0 };
  const discountedPrice =
    product.discount.type === "PERCENTAGE"
      ? Math.max(0, product.price * (1 - product.discount.value / 100))
      : Math.max(0, product.price - product.discount.value);
  return {
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    discountPercentage: discountedPrice < product.price ? Math.round((1 - discountedPrice / product.price) * 100) : 0,
  };
}

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const wishlist = data as WishlistResponse | undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Wishlist</h1>

      {isLoading ? (
        <LoadingState rows={3} />
      ) : !wishlist || wishlist.products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Save products you love to find them here later."
          action={<Button render={<Link href="/products">Browse Products</Link>} />}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.products.map((product) => {
            const { discountedPrice, discountPercentage } = computeDisplayPrice(product);
            return (
              <ProductCard
                key={product._id}
                product={{
                  id: product._id,
                  name: product.name,
                  slug: product.slug,
                  brand: product.brand,
                  imageUrl: product.images?.[0]?.url ?? "/placeholder-product.svg",
                  imageAlt: product.images?.[0]?.altText ?? product.name,
                  category: product.category,
                  price: product.price,
                  discountedPrice,
                  discountPercentage,
                  ratingAverage: product.ratingAverage,
                  ratingCount: product.ratingCount,
                  stock: product.stock,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
