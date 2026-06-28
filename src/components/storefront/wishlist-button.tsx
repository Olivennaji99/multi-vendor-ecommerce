"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/hooks/use-wishlist";

interface WishlistResponse {
  products: { _id: string }[];
}

export function WishlistButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data } = useWishlist({ enabled: Boolean(session) });
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const wishlist = data as WishlistResponse | undefined;
  const isWishlisted = Boolean(wishlist?.products?.some((product) => product._id === productId));

  function handleClick() {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isWishlisted) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId, { onSuccess: () => toast.success("Added to wishlist") });
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={handleClick}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("size-4", isWishlisted && "fill-brand-red text-brand-red")} />
    </Button>
  );
}
