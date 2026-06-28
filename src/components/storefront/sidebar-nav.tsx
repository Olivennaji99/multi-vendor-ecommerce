"use client";

import {
  Award,
  Grid3x3,
  Heart,
  Home,
  LogOut,
  MapPin,
  Package,
  Settings,
  Sparkles,
  Tag,
  Ticket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

const mainNav: NavItem[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/categories", label: "Categories", icon: Grid3x3 },
  { href: "/products?onSale=true", label: "Deals", icon: Tag, badge: "Hot" },
  { href: "/products?sort=newest", label: "New Arrivals", icon: Sparkles },
  { href: "/products?sort=popular", label: "Best Sellers", icon: Award },
];

const accountNav: NavItem[] = [
  { href: "/orders", label: "My Orders", icon: Package, exact: true },
  { href: "/wishlist", label: "Wishlist", icon: Heart, exact: true },
  { href: "/account?tab=coupons", label: "Coupons", icon: Ticket },
  { href: "/account?tab=addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Account Settings", icon: Settings, exact: true },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"
      )}
    >
      <Icon className="size-4.5" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge className="bg-brand-red text-brand-red-foreground">{item.badge}</Badge>
      )}
    </Link>
  );
}

function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
    >
      <LogOut className="size-4.5" />
      <span className="flex-1">Sign out</span>
    </button>
  );
}

export function SidebarNavContent() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex flex-col gap-1">
        {mainNav.map((item, index) => (
          <NavLink
            key={`${item.href}-${index}`}
            item={item}
            active={item.exact ? pathname === item.href : false}
          />
        ))}
      </nav>
      <Separator />
      <nav className="flex flex-col gap-1">
        {accountNav.map((item, index) => (
          <NavLink
            key={`${item.href}-${index}`}
            item={item}
            active={item.exact ? pathname === item.href : false}
          />
        ))}
        {session && <SignOutButton />}
      </nav>
      <div className="mt-auto rounded-xl bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
        <p className="text-xs font-medium tracking-wide uppercase opacity-80">Special Offer</p>
        <p className="mt-1 text-lg font-semibold">Summer Sale Up to 50% Off</p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3"
          render={<Link href="/products">Shop Now</Link>}
        />
      </div>
    </div>
  );
}

export function SidebarNav() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r bg-sidebar p-4 lg:block">
      <SidebarNavContent />
    </aside>
  );
}
