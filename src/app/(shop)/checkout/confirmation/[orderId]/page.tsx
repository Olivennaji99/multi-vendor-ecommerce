import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@shared/db/connection";
import { ForbiddenError, NotFoundError } from "@shared/lib/errors";
import { formatCurrency } from "@shared/lib/format";
import { getOrderById } from "@shared/services/order.service";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Order Confirmed | NovaShop" };
export const dynamic = "force-dynamic";

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutConfirmationPage({ params }: ConfirmationPageProps) {
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

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-8" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Order Confirmed!</h1>
      <p className="text-muted-foreground">
        Thank you for your purchase. Your order <span className="font-medium">{order.orderNumber}</span>{" "}
        has been placed successfully.
      </p>

      <Card className="w-full text-left">
        <CardContent className="flex flex-col gap-2 p-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order number</span>
            <span className="font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{order.status}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-semibold">{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" render={<Link href="/orders">View My Orders</Link>} />
        <Button render={<Link href="/products">Continue Shopping</Link>} />
      </div>
    </div>
  );
}
