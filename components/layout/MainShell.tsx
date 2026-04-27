"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import MobileSidebarTrigger from "@/components/layout/MobileSidebarTrigger";
import { useSidebarStore } from "@/stores/sidebar";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const mobileDrawerOpen = useSidebarStore((s) => s.mobileDrawerOpen);
  const setMobileDrawerOpen = useSidebarStore((s) => s.setMobileDrawerOpen);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <Sidebar />
      <MobileSidebarTrigger />

      {mobileDrawerOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileDrawerOpen(false)}
          className="md:hidden fixed inset-0 top-(--navbar-height) z-20 bg-black/40 backdrop-blur-[2px]"
        />
      ) : null}

      <main
        className={`pt-(--navbar-height) pb-16 md:pb-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "md:pl-(--sidebar-width)" : "md:pl-16"
        }`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>

      <MobileNav />
    </div>
  );
}
