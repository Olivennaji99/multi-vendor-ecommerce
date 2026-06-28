import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { formatDate } from "@shared/lib/format";
import { listUsers } from "@shared/services/user.service";

import { auth } from "@/lib/auth";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Users | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  await connectToDatabase();

  const result = await listUsers(
    { id: session!.user.id, role: session!.user.role },
    { page: 1, limit: 50 }
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">{result.total} registered accounts</p>
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((user) => (
              <TableRow key={user._id.toString()}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  {user.role !== "ADMIN" && (
                    <UserActiveToggle userId={user._id.toString()} isActive={user.isActive} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
