import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency, formatDate } from "@shared/lib/format";
import { listOrderItemsForSeller } from "@shared/services/order.service";

import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Orders | Seller" };
export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const session = await auth();
  await connectToDatabase();
  const result = await listOrderItemsForSeller(
    { id: session!.user.id, role: session!.user.role },
    { page: 1, limit: 50 }
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{result.total} order items</p>
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((item) => {
              const doc = item as unknown as {
                _id: { toString(): string };
                nameSnapshot: string;
                priceSnapshot: number;
                quantity: number;
                order: {
                  orderNumber: string;
                  status: string;
                  createdAt: Date;
                  customer: { name: string } | null;
                };
              };
              return (
                <TableRow key={doc._id.toString()}>
                  <TableCell className="font-medium">{doc.order.orderNumber}</TableCell>
                  <TableCell>
                    {doc.nameSnapshot} &times; {doc.quantity}
                  </TableCell>
                  <TableCell>{doc.order.customer?.name}</TableCell>
                  <TableCell>{formatDate(doc.order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(doc.priceSnapshot * doc.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{doc.order.status}</Badge>
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
