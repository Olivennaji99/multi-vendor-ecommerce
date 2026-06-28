import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency } from "@shared/lib/format";
import { listProducts } from "@shared/services/product.service";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductFlagToggle } from "@/components/admin/product-flag-toggle";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Products | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await connectToDatabase();
  const result = await listProducts({ activeOnly: false, page: 1, limit: 50, sort: "newest" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{result.total} products across all sellers</p>
        </div>
        <Button render={<Link href="/admin/products/new"><Plus className="size-4" /> Add Product</Link>} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No products yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Trending</TableHead>
              <TableHead>Recommended</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((product) => {
              const category = product.category as unknown as { name: string } | null;
              const id = product._id.toString();
              return (
                <TableRow key={id}>
                  <TableCell className="font-medium">
                    {product.name}
                    {!product.isActive && (
                      <Badge variant="outline" className="ml-2">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category?.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">
                    {product.stock < 5 ? (
                      <span className="font-medium text-brand-red">{product.stock}</span>
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell>
                    <ProductFlagToggle productId={id} flag="isFeatured" value={product.isFeatured} />
                  </TableCell>
                  <TableCell>
                    <ProductFlagToggle productId={id} flag="isTrending" value={product.isTrending} />
                  </TableCell>
                  <TableCell>
                    <ProductFlagToggle productId={id} flag="isRecommended" value={product.isRecommended} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        render={<Link href={`/admin/products/${id}/edit`}>Edit</Link>}
                      />
                      <DeleteProductButton productId={id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
