import { CartPanel } from "./cart-panel";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { SidebarNav } from "./sidebar-nav";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
      <MobileSidebar />
      <CartPanel />
    </div>
  );
}
