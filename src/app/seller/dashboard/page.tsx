import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { connectToDatabase } from "@shared/db/connection";
import { formatCurrency } from "@shared/lib/format";
import {
  getBestSellingProducts,
  getMonthlyRevenue,
} from "@shared/services/analytics.service";
import { getLowStockProducts, listSellerProducts } from "@shared/services/product.service";

import { auth } from "@/lib/auth";
import { ChartCard } from "@/components/dashboard/chart-card";
import { RankingList } from "@/components/dashboard/ranking-list";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Seller Dashboard | NovaShop" };
export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const session = await auth();
  const actor = { id: session!.user.id, role: session!.user.role };
  await connectToDatabase();

  const [revenueData, bestSelling, lowStock, productsResult] = await Promise.all([
    getMonthlyRevenue(actor, 6, actor.id),
    getBestSellingProducts(actor, 5, actor.id),
    getLowStockProducts(actor.id),
    listSellerProducts(actor, { page: 1, limit: 1000 }),
  ]);

  const totalRevenue = revenueData.reduce((sum, point) => sum + ("revenue" in point ? point.revenue : 0), 0);
  const totalProducts = productsResult.total;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seller Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your store performance at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (6 months)" value={formatCurrency(totalRevenue)} icon={DollarSign} />
        <StatCard label="My Products" value={String(totalProducts)} icon={Package} />
        <StatCard label="Low Stock Items" value={String(lowStock.length)} icon={ShoppingCart} />
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-red/30 bg-brand-red/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-brand-red" />
          <div className="flex-1">
            <p className="font-medium text-brand-red">Low Stock Warning</p>
            <p className="text-sm text-muted-foreground">
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} have fewer than 5 units left.
            </p>
          </div>
          <Button size="sm" variant="outline" render={<Link href="/seller/inventory">View Inventory</Link>} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Sales Trend" description="Revenue over the last 6 months">
          <RevenueChart data={revenueData as { month: string; revenue: number }[]} />
        </ChartCard>
        <ChartCard title="Best Selling Products" description="By units sold">
          <RankingList
            items={bestSelling.map((product) => ({ label: product.name, value: product.unitsSold }))}
            formatValue={(value) => `${value} sold`}
          />
        </ChartCard>
      </div>

      <ChartCard title="Inventory Overview" description="Current stock levels">
        <div className="flex flex-col gap-2">
          {productsResult.items.slice(0, 8).map((product) => (
            <div key={product._id.toString()} className="flex items-center justify-between text-sm">
              <span className="line-clamp-1">{product.name}</span>
              <Badge variant={product.stock < 5 ? "destructive" : "outline"}>{product.stock} in stock</Badge>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
