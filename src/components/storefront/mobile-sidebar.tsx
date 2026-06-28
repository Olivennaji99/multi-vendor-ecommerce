"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui.store";

import { SidebarNavContent } from "./sidebar-nav";

export function MobileSidebar() {
  const isOpen = useUiStore((state) => state.isMobileSidebarOpen);
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <SidebarNavContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
