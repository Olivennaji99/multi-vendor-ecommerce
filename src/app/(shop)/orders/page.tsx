import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency, formatDate } from "@shared/lib/format";
import { getOrderHistory } from "@shared/services/order.service";

import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "My Orders | NovaShop" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  await connectToDatabase();
  const result = await getOrderHistory(
    { id: session!.user.id, role: session!.user.role },
    { page: 1, limit: 20 }
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>

      {result.items.length === 0 ? (
        <EmptyState title="No orders yet" message="Your order history will show up here." />
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((order) => (
            <Link key={order._id.toString()} href={`/orders/${order._id.toString()}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{order.status}</Badge>
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
