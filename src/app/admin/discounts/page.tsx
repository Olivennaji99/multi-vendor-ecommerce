import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { formatDate } from "@shared/lib/format";
import { listDiscounts } from "@shared/services/discount.service";

import { auth } from "@/lib/auth";
import { DeleteDiscountButton } from "@/components/admin/delete-discount-button";
import { DiscountActiveToggle } from "@/components/admin/discount-active-toggle";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Discounts | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const session = await auth();
  await connectToDatabase();
  const discounts = await listDiscounts({ id: session!.user.id, role: session!.user.role });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Discounts</h1>
          <p className="text-sm text-muted-foreground">{discounts.length} discount campaigns</p>
        </div>
        <Button render={<Link href="/admin/discounts/new"><Plus className="size-4" /> Add Discount</Link>} />
      </div>

      {discounts.length === 0 ? (
        <EmptyState title="No discounts yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Flash Sale</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount._id.toString()}>
                <TableCell className="font-medium">{discount.name}</TableCell>
                <TableCell>
                  {discount.type === "PERCENTAGE" ? `${discount.value}%` : discount.value} off (
                  {discount.appliesTo.toLowerCase()})
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(discount.startsAt)} &rarr; {formatDate(discount.endsAt)}
                </TableCell>
                <TableCell>
                  {discount.isFlashSale && <Badge className="bg-brand-red text-brand-red-foreground">Flash</Badge>}
                </TableCell>
                <TableCell>
                  <DiscountActiveToggle discountId={discount._id.toString()} isActive={discount.isActive} />
                </TableCell>
                <TableCell className="text-right">
                  <DeleteDiscountButton discountId={discount._id.toString()} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
