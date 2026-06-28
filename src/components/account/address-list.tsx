"use client";

import { Star, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeAddressAction, setDefaultAddressAction } from "@/actions/customer.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface AddressItem {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export function AddressList({ addresses }: { addresses: AddressItem[] }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeAddressAction(id);
      if (!result.success) toast.error(result.formError ?? "Could not remove address");
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddressAction(id);
      if (!result.success) toast.error(result.formError ?? "Could not update address");
    });
  }

  if (addresses.length === 0) {
    return <p className="text-sm text-muted-foreground">You haven&apos;t added any addresses yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium">{address.label}</p>
                {address.isDefault && <Badge variant="outline">Default</Badge>}
              </div>
              <p className="text-muted-foreground">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
              </p>
              <p className="text-muted-foreground">
                {address.city}, {address.state} {address.postalCode}, {address.country}
              </p>
              <p className="text-muted-foreground">{address.phone}</p>
            </div>
            <div className="flex flex-col gap-1">
              {!address.isDefault && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => handleSetDefault(address.id)}
                  aria-label="Set as default"
                >
                  <Star className="size-3.5" />
                </Button>
              )}
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                disabled={isPending}
                onClick={() => handleRemove(address.id)}
                aria-label="Remove address"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
