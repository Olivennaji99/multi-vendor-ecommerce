"use client";

import { Grid3x3, LayoutDashboard, LayoutTemplate, Package, ShoppingCart, Store, Tag, Users } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const adminNavItems: DashboardNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Grid3x3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/homepage-curation", label: "Homepage", icon: LayoutTemplate },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={adminNavItems}>{children}</DashboardShell>;
}
