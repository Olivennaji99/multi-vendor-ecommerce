"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui.store";

import { DashboardHeader } from "./dashboard-header";
import { DashboardNavContent, DashboardSidebar, type DashboardNavItem } from "./dashboard-sidebar";

export function DashboardShell({
  navItems,
  children,
}: {
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}) {
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar items={navItems} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <DashboardNavContent items={navItems} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
