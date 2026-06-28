import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import {
  getFeaturedProducts,
  getFlashSaleProducts,
  getRecommendedProducts,
  getTrendingProducts,
} from "@shared/services/homepage.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Homepage Curation | Admin" };
export const dynamic = "force-dynamic";

function ProductSummaryList({ products }: { products: { name: string; slug: string }[] }) {
  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing selected yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {products.map((product) => (
        <li key={product.slug} className="line-clamp-1">
          {product.name}
        </li>
      ))}
    </ul>
  );
}

export default async function HomepageCurationPage() {
  await connectToDatabase();

  const [featured, trending, recommended, flashSale] = await Promise.all([
    getFeaturedProducts(8),
    getTrendingProducts(8),
    getRecommendedProducts(8),
    getFlashSaleProducts(8),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Homepage Curation</h1>
        <p className="text-sm text-muted-foreground">
          Manage which products appear in each homepage section.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>Shown in &quot;Best Deals for You&quot;</CardDescription>
            </div>
            <Button size="sm" variant="outline" render={<Link href="/admin/products">Manage</Link>} />
          </CardHeader>
          <CardContent>
            <ProductSummaryList products={featured.map((p) => ({ name: p.name, slug: p.slug }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Trending Products</CardTitle>
              <CardDescription>Ranked by views</CardDescription>
            </div>
            <Button size="sm" variant="outline" render={<Link href="/admin/products">Manage</Link>} />
          </CardHeader>
          <CardContent>
            <ProductSummaryList products={trending.map((p) => ({ name: p.name, slug: p.slug }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recommended Products</CardTitle>
              <CardDescription>Shown in &quot;Recommended for You&quot;</CardDescription>
            </div>
            <Button size="sm" variant="outline" render={<Link href="/admin/products">Manage</Link>} />
          </CardHeader>
          <CardContent>
            <ProductSummaryList products={recommended.map((p) => ({ name: p.name, slug: p.slug }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Flash Sale</CardTitle>
              <CardDescription>
                {flashSale.endsAt ? `Ends ${flashSale.endsAt.toLocaleString()}` : "No active flash sale"}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" render={<Link href="/admin/discounts">Manage</Link>} />
          </CardHeader>
          <CardContent>
            <ProductSummaryList products={flashSale.products.map((p) => ({ name: p.name, slug: p.slug }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
