import { Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency } from "@shared/lib/format";
import { NotFoundError } from "@shared/lib/errors";
import type { ICategory } from "@shared/models/Category.model";
import type { IDiscount } from "@shared/models/Discount.model";
import type { IProductImage } from "@shared/models/ProductImage.model";
import { toProductCardData } from "@shared/lib/product-presentation";
import {
  computeDiscountedPrice,
  computeDiscountPercentage,
} from "@shared/services/discount.service";
import { getProductBySlug, listProducts } from "@shared/services/product.service";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ReviewForm } from "@/components/storefront/review-form";
import { ReviewList } from "@/components/storefront/review-list";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  try {
    const product = await getProductBySlug(slug);
    return { title: `${product.name} | NovaShop`, description: product.description };
  } catch {
    return { title: "Product | NovaShop" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  let product;
  try {
    product = await getProductBySlug(slug, { incrementView: true });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const discount = product.discount as unknown as IDiscount | null;
  const discountedPrice = computeDiscountedPrice(product.price, discount);
  const discountPercentage = computeDiscountPercentage(product.price, discountedPrice);
  const images = product.images as unknown as IProductImage[];
  const category = product.category as unknown as ICategory;
  const productId = product._id.toString();

  const relatedResult = await listProducts({
    category: category.slug,
    page: 1,
    limit: 5,
    sort: "newest",
  });
  const related = relatedResult.items
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4)
    .map((item) => toProductCardData(item));

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery
          images={images.map((image) => ({ url: image.url, altText: image.altText }))}
          productName={product.name}
        />
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm text-muted-foreground">{category?.name}</span>
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-warning">
              <Star className="size-4 fill-warning" /> {product.ratingAverage.toFixed(1)}
            </span>
            <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(discountedPrice)}</span>
            {discountPercentage > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
                <Badge className="bg-brand-red text-brand-red-foreground">
                  -{discountPercentage}%
                </Badge>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <p className="text-sm">
            {product.stock > 0 ? (
              <span className="font-medium text-success">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="font-medium text-destructive">Out of Stock</span>
            )}
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <AddToCartButton productId={productId} />
            </div>
            <WishlistButton productId={productId} />
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Customer Reviews</h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ReviewList productId={productId} />
          <div>
            <h3 className="mb-3 text-sm font-semibold">Write a review</h3>
            <ReviewForm productId={productId} productSlug={product.slug} />
          </div>
        </div>
      </section>

      {related.length > 0 && <ProductGrid title="You might also like" products={related} />}
    </div>
  );
}
