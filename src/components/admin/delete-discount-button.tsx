"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteDiscountAction } from "@/actions/discount.actions";
import { Button } from "@/components/ui/button";

export function DeleteDiscountButton({ discountId }: { discountId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this discount? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteDiscountAction(discountId);
      if (!result.success) toast.error(result.formError ?? "Could not delete discount");
      else toast.success("Discount deleted");
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
      aria-label="Delete discount"
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
