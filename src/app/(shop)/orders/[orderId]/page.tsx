import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@shared/db/connection";
import { ForbiddenError, NotFoundError } from "@shared/lib/errors";
import { formatCurrency, formatDate } from "@shared/lib/format";
import { getOrderById } from "@shared/services/order.service";

import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Order Details | NovaShop" };
export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const session = await auth();
  await connectToDatabase();

  let order;
  try {
    order = await getOrderById({ id: session!.user.id, role: session!.user.role }, orderId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) notFound();
    throw error;
  }

  const items = order.items as unknown as {
    _id: { toString(): string };
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
  }[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant="outline">{order.status}</Badge>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <h2 className="font-semibold">Items</h2>
          {items.map((item) => (
            <div key={item._id.toString()} className="flex justify-between text-sm">
              <span>
                {item.nameSnapshot} &times; {item.quantity}
              </span>
              <span>{formatCurrency(item.priceSnapshot * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-sm text-brand-red">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-1 p-6 text-sm">
          <h2 className="mb-2 font-semibold">Shipping Address</h2>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p>{order.shippingAddress.phone}</p>
        </CardContent>
      </Card>
    </div>
  );
}
