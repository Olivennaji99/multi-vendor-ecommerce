"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@shared/lib/format";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";

interface CartItemProduct {
  _id: string;
  name: string;
  slug: string;
  images: { url: string; altText: string }[];
}

interface CartItem {
  _id: string;
  quantity: number;
  priceSnapshot: number;
  product: CartItemProduct;
}

interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
}

interface CartResponse {
  items: CartItem[];
  totals: CartTotals;
}

export default function CartPage() {
  const { data, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const cart = data as CartResponse | undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Cart</h1>

      {isLoading ? (
        <LoadingState rows={3} />
      ) : !cart || cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse products and add something you like."
          action={<Button render={<Link href="/products">Start Shopping</Link>} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {cart.items.map((item) => (
              <Card key={item._id}>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.product.images?.[0]?.url ?? "/placeholder-product.svg"}
                      alt={item.product.images?.[0]?.altText ?? item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
                      {item.product.name}
                    </Link>
                    <span className="font-semibold">{formatCurrency(item.priceSnapshot)}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          updateItem.mutate({
                            itemId: item._id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          updateItem.mutate({ itemId: item._id, quantity: item.quantity + 1 })
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem.mutate(item._id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardContent className="flex flex-col gap-3 p-6">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart.totals.subtotal)}</span>
              </div>
              {cart.totals.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-brand-red">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.totals.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(cart.totals.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(cart.totals.total)}</span>
              </div>
              <Button className="mt-2 w-full" render={<Link href="/checkout">Proceed to Checkout</Link>} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
