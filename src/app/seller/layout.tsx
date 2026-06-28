"use client";

import { Bell, LayoutDashboard, Package, ShoppingCart, Warehouse } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const sellerNavItems: DashboardNavItem[] = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/inventory", label: "Inventory", icon: Warehouse },
  { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/notifications", label: "Notifications", icon: Bell },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={sellerNavItems}>{children}</DashboardShell>;
}
