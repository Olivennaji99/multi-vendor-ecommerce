"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteProductAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.success) toast.error(result.formError ?? "Could not delete product");
      else toast.success("Product deleted");
    });
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleClick}
      disabled={isPending}
      aria-label="Delete product"
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
