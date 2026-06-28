"use client";

import { Heart, Menu, Search, ShoppingCart } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCart } from "@/hooks/use-cart";
import { useUiStore } from "@/stores/ui.store";

interface CartResponse {
  items: unknown[];
}

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: cart } = useCart({ enabled: Boolean(session) });
  const toggleCartPanel = useUiStore((state) => state.toggleCartPanel);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);

  const cartCount = (cart as CartResponse | undefined)?.items.length ?? 0;

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(search)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobileSidebar}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      <div className="hidden lg:block">
        <Logo />
      </div>
      <form onSubmit={handleSearchSubmit} className="relative max-w-xl flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search for products, brands and more..."
          className="pl-9"
        />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {session && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Wishlist"
            render={
              <Link href="/wishlist">
                <Heart className="size-4.5" />
              </Link>
            }
          />
        )}
        <NotificationBell />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={toggleCartPanel}
          aria-label="Cart"
        >
          <ShoppingCart className="size-4.5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
              {cartCount}
            </Badge>
          )}
        </Button>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="ml-1 flex items-center gap-2 rounded-full outline-none"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{session.user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/orders">My Orders</Link>} />
              <DropdownMenuItem render={<Link href="/account">Account Settings</Link>} />
              {session.user.role === "ADMIN" && (
                <DropdownMenuItem render={<Link href="/admin/dashboard">Admin Dashboard</Link>} />
              )}
              {session.user.role === "SELLER" && (
                <DropdownMenuItem render={<Link href="/seller/dashboard">Seller Dashboard</Link>} />
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" render={<Link href="/login">Sign in</Link>} />
        )}
      </div>
    </header>
  );
}
