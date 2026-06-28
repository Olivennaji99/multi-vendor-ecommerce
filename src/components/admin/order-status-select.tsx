"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ORDER_STATUSES, type OrderStatus } from "@shared/types/enums";

import { updateOrderStatusAction } from "@/actions/order.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    const next = value as OrderStatus;
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (!result.success) {
        setCurrent(previous);
        toast.error(result.formError ?? "Could not update order status");
      } else {
        toast.success("Order status updated");
      }
    });
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
