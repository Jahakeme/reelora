"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useSidebarStore } from "@/stores/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <div className="min-h-dvh bg-background">
      <Navbar onToggleSidebar={toggle} />
      <Sidebar isOpen={isOpen} />

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
