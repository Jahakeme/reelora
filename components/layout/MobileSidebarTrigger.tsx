"use client";

import { useRef } from "react";
import { useSidebarStore } from "@/stores/sidebar";

export default function MobileSidebarTrigger() {
  const setMobileDrawerOpen = useSidebarStore((s) => s.setMobileDrawerOpen);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <button
      type="button"
      onClick={() => setMobileDrawerOpen(true)}
      onTouchStart={(e) => {
        const t = e.touches[0];
        startRef.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchMove={(e) => {
        if (!startRef.current) return;
        const t = e.touches[0];
        const dx = t.clientX - startRef.current.x;
        const dy = t.clientY - startRef.current.y;
        if (Math.abs(dx) > Math.abs(dy) && dx > 24) {
          setMobileDrawerOpen(true);
          startRef.current = null;
        }
      }}
      onTouchEnd={() => {
        startRef.current = null;
      }}
      aria-label="Open menu"
      className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 px-2 py-3 group focus-ring rounded-r-lg"
    >
      <span className="block w-1 h-12 rounded-r-full bg-text-muted group-hover:bg-text-primary group-active:bg-text-primary transition-base" />
    </button>
  );
}
