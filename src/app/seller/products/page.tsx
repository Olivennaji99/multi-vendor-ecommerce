import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency } from "@shared/lib/format";
import { listSellerProducts } from "@shared/services/product.service";

import { auth } from "@/lib/auth";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "My Products | Seller" };
export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const session = await auth();
  await connectToDatabase();
  const result = await listSellerProducts(
    { id: session!.user.id, role: session!.user.role },
    { page: 1, limit: 50 }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Products</h1>
          <p className="text-sm text-muted-foreground">{result.total} products</p>
        </div>
        <Button render={<Link href="/seller/products/new"><Plus className="size-4" /> Add Product</Link>} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No products yet" message="Add your first product to start selling." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        render={<Link href={`/seller/products/${id}/edit`}>Edit</Link>}
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
