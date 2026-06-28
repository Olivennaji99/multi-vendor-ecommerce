"use client";

import { ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api-client";
import { useAddToCart } from "@/hooks/use-cart";

export function AddToCartButton({
  productId,
  variant = "full",
}: {
  productId: string;
  variant?: "full" | "icon";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const addToCart = useAddToCart();

  function handleClick() {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    addToCart.mutate(
      { product: productId, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: (error) => {
          toast.error(error instanceof ApiClientError ? error.message : "Could not add to cart");
        },
      }
    );
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleClick}
        disabled={addToCart.isPending}
        aria-label="Add to cart"
      >
        <ShoppingCart className="size-4" />
      </Button>
    );
  }

  return (
    <Button type="button" onClick={handleClick} disabled={addToCart.isPending} className="w-full">
      <ShoppingCart className="size-4" />
      {addToCart.isPending ? "Adding..." : "Add to cart"}
    </Button>
  );
}
