"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { setDiscountActiveAction } from "@/actions/discount.actions";
import { Switch } from "@/components/ui/switch";

export function DiscountActiveToggle({
  discountId,
  isActive,
}: {
  discountId: string;
  isActive: boolean;
}) {
  const [checked, setChecked] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const result = await setDiscountActiveAction(discountId, next);
      if (!result.success) {
        setChecked(!next);
        toast.error(result.formError ?? "Could not update discount");
      }
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} disabled={isPending} />;
}
