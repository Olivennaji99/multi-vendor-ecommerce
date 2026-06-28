import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency, formatDate } from "@shared/lib/format";
import { listOrdersForAdmin } from "@shared/services/order.service";
import type { OrderStatus } from "@shared/types/enums";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { EmptyState } from "@/components/states/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Orders | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await connectToDatabase();
  const result = await listOrdersForAdmin({ page: 1, limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{result.total} orders placed</p>
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((order) => {
              const doc = order as unknown as {
                _id: { toString(): string };
                orderNumber: string;
                total: number;
                status: OrderStatus;
                createdAt: Date;
                customer: { name: string; email: string } | null;
              };
              return (
                <TableRow key={doc._id.toString()}>
                  <TableCell className="font-medium">{doc.orderNumber}</TableCell>
                  <TableCell>
                    <p>{doc.customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.customer?.email}</p>
                  </TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(doc.total)}</TableCell>
                  <TableCell className="text-right">
                    <OrderStatusSelect orderId={doc._id.toString()} status={doc.status} />
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
