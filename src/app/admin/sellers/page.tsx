import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency } from "@shared/lib/format";
import { listSellers } from "@shared/services/seller.service";

import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Sellers | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const session = await auth();
  await connectToDatabase();

  const result = await listSellers(
    { id: session!.user.id, role: session!.user.role },
    { page: 1, limit: 50 }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sellers</h1>
          <p className="text-sm text-muted-foreground">{result.total} sellers on the platform</p>
        </div>
        <Button render={<Link href="/admin/sellers/new"><Plus className="size-4" /> Add Seller</Link>} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No sellers yet" message="Create the first seller account to get started." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((profile) => {
              const doc = profile as unknown as {
                _id: { toString(): string };
                storeName: string;
                totalRevenue: number;
                user: { name: string; email: string; isActive: boolean };
                assignedCategories: { _id: string; name: string }[];
              };
              return (
                <TableRow key={doc._id.toString()}>
                  <TableCell className="font-medium">{doc.storeName}</TableCell>
                  <TableCell>
                    <p>{doc.user.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.user.email}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.assignedCategories.map((category) => (
                        <Badge key={category._id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.user.isActive ? "default" : "destructive"}>
                      {doc.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(doc.totalRevenue)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
