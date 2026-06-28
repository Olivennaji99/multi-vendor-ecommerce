"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@shared/lib/format";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { useUiStore } from "@/stores/ui.store";

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

export function CartPanel() {
  const { data: session } = useSession();
  const isOpen = useUiStore((state) => state.isCartPanelOpen);
  const closeCartPanel = useUiStore((state) => state.closeCartPanel);
  const { data, isLoading } = useCart({ enabled: Boolean(session) && isOpen });
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const cart = data as CartResponse | undefined;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCartPanel()}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>My Cart {cart ? `(${cart.items.length})` : ""}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {!session ? (
            <EmptyState
              icon={ShoppingBag}
              title="Sign in to view your cart"
              message="Create an account or sign in to start adding items."
              action={<Button size="sm" render={<Link href="/login">Sign in</Link>} />}
            />
          ) : isLoading ? (
            <LoadingState rows={3} />
          ) : !cart || cart.items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              message="Browse products and add something you like."
            />
          ) : (
            <ul className="flex flex-col gap-4 py-4">
              {cart.items.map((item) => (
                <li key={item._id} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.product.images?.[0]?.url ?? "/placeholder-product.svg"}
                      alt={item.product.images?.[0]?.altText ?? item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-1 text-sm font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.priceSnapshot)}
                    </span>
                    <div className="flex items-center gap-2">
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
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <SheetFooter className="border-t">
            <div className="flex w-full flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart.totals.subtotal)}</span>
              </div>
              {cart.totals.discountTotal > 0 && (
                <div className="flex justify-between text-brand-red">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.totals.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(cart.totals.shippingFee)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(cart.totals.total)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={closeCartPanel}
              render={<Link href="/checkout">Checkout ({cart.items.length})</Link>}
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
