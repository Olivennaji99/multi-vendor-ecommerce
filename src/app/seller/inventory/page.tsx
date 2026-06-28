import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { listSellerProducts } from "@shared/services/product.service";

import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Inventory | Seller" };
export const dynamic = "force-dynamic";

export default async function SellerInventoryPage() {
  const session = await auth();
  await connectToDatabase();
  const allProducts = await listSellerProducts(
    { id: session!.user.id, role: session!.user.role },
    { page: 1, limit: 100 }
  );
  const lowStockCount = allProducts.items.filter((product) => product.stock < 5).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          {lowStockCount} product{lowStockCount === 1 ? "" : "s"} below the low-stock threshold (5 units)
        </p>
      </div>

      {allProducts.items.length === 0 ? (
        <EmptyState title="No products yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProducts.items.map((product) => (
              <TableRow key={product._id.toString()}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">
                  {product.stock < 5 ? (
                    <Badge className="bg-brand-red text-brand-red-foreground">Low Stock</Badge>
                  ) : (
                    <Badge variant="outline">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
