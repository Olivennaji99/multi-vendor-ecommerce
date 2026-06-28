"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { setUserActiveAction } from "@/actions/user.actions";
import { Switch } from "@/components/ui/switch";

export function UserActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [checked, setChecked] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const result = await setUserActiveAction(userId, next);
      if (!result.success) {
        setChecked(!next);
        toast.error(result.formError ?? "Could not update user");
      }
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} disabled={isPending} />;
}
