import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShoppingBag className="size-4.5" />
      </span>
      <span className="text-lg tracking-tight">NovaShop</span>
    </Link>
  );
}
