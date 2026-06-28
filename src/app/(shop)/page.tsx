import { connectToDatabase } from "@shared/db/connection";
import { listCategories } from "@shared/services/category.service";
import {
  getFeaturedProducts,
  getFlashSaleProducts,
  getRecommendedProducts,
} from "@shared/services/homepage.service";
import { toProductCardData } from "@shared/lib/product-presentation";

import { CategoryIconGrid } from "@/components/storefront/category-icon-grid";
import { FlashSaleSection } from "@/components/storefront/flash-sale-section";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductGrid } from "@/components/storefront/product-grid";
import { PromoTiles } from "@/components/storefront/promo-tiles";
import { TrustBadges } from "@/components/storefront/trust-badges";

// This app doesn't use the Cache Components model, so without an explicit
// dynamic signal Next would prerender this page once at build time and
// freeze its data (products/flash sales change far too often for that).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectToDatabase();

  const [categories, featured, flashSale, recommended] = await Promise.all([
    listCategories({ activeOnly: true }),
    getFeaturedProducts(8),
    getFlashSaleProducts(8),
    getRecommendedProducts(8),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <HeroBanner />
      <CategoryIconGrid
        categories={categories.map((category) => ({
          name: category.name,
          slug: category.slug,
          icon: category.icon,
        }))}
      />
      <PromoTiles />
      {flashSale.products.length > 0 && (
        <FlashSaleSection
          products={flashSale.products.map((product) => toProductCardData(product))}
          endsAt={flashSale.endsAt ? flashSale.endsAt.toISOString() : null}
        />
      )}
      <ProductGrid
        title="Best Deals for You"
        viewAllHref="/products?sort=price-asc"
        products={featured.map((product) => toProductCardData(product))}
      />
      <ProductGrid
        title="Recommended for You"
        viewAllHref="/products"
        products={recommended.map((product) => toProductCardData(product))}
      />
      <TrustBadges />
    </div>
  );
}
