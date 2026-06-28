"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleProductFlagAction } from "@/actions/product.actions";
import { Switch } from "@/components/ui/switch";

export function ProductFlagToggle({
  productId,
  flag,
  value,
}: {
  productId: string;
  flag: "isFeatured" | "isTrending" | "isRecommended";
  value: boolean;
}) {
  const [checked, setChecked] = useState(value);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const result = await toggleProductFlagAction(productId, flag, next);
      if (!result.success) {
        setChecked(!next);
        toast.error(result.formError ?? "Could not update product");
      }
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} disabled={isPending} />;
}
