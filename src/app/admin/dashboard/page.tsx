import { DollarSign, Package, Store, Users } from "lucide-react";
import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency, formatDate } from "@shared/lib/format";
import {
  getBestSellingProducts,
  getMonthlyRevenue,
  getOrdersOverTime,
  getPlatformStats,
  getRecentOrders,
  getTopSellersByRevenue,
} from "@shared/services/analytics.service";
import { getPlatformUserCounts, getRecentUsers } from "@shared/services/user.service";

import { auth } from "@/lib/auth";
import { ChartCard } from "@/components/dashboard/chart-card";
import { OrdersChart } from "@/components/dashboard/orders-chart";
import { RankingList } from "@/components/dashboard/ranking-list";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Admin Dashboard | NovaShop" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const actor = { id: session!.user.id, role: session!.user.role };

  await connectToDatabase();

  const [stats, userCounts, revenueData, ordersData, topSellers, bestSelling, recentOrders, recentUsers] =
    await Promise.all([
      getPlatformStats(actor),
      getPlatformUserCounts(),
      getMonthlyRevenue(actor, 6),
      getOrdersOverTime(actor, 6),
      getTopSellersByRevenue(actor, 5),
      getBestSellingProducts(actor, 5),
      getRecentOrders(actor, 5),
      getRecentUsers(5),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={String(userCounts.totalUsers)} icon={Users} />
        <StatCard label="Total Sellers" value={String(userCounts.totalSellers)} icon={Store} />
        <StatCard label="Total Products" value={String(stats.totalProducts)} icon={Package} />
        <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Revenue" description="Last 6 months">
          <RevenueChart data={revenueData as { month: string; revenue: number }[]} />
        </ChartCard>
        <ChartCard title="Orders" description="Last 6 months">
          <OrdersChart data={ordersData} />
        </ChartCard>
        <ChartCard title="Top 5 Sellers" description="By revenue">
          <RankingList
            items={topSellers.map((seller) => ({ label: seller.storeName, value: seller.revenue }))}
            formatValue={formatCurrency}
          />
        </ChartCard>
        <ChartCard title="Best Selling Products" description="By units sold">
          <RankingList
            items={bestSelling.map((product) => ({ label: product.name, value: product.unitsSold }))}
            formatValue={(value) => `${value} sold`}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Recent Orders">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => {
                const doc = order as unknown as {
                  _id: { toString(): string };
                  orderNumber: string;
                  status: string;
                  total: number;
                  createdAt: Date;
                };
                return (
                  <TableRow key={doc._id.toString()}>
                    <TableCell>
                      <p className="font-medium">{doc.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(doc.total)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ChartCard>
        <ChartCard title="Recent Users">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user._id.toString()}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>
      </div>
    </div>
  );
}
