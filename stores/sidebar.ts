"use client";

import { createStore, useStore } from "zustand";
import {
  createContext,
  createElement,
  useContext,
  useRef,
  type ReactNode,
} from "react";

export interface SidebarState {
  isOpen: boolean;
  mobileDrawerOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
}

type SidebarStore = ReturnType<typeof createSidebarStore>;

function writeCookie(isOpen: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `sidebar-open=${isOpen ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
}

function createSidebarStore(initialIsOpen: boolean) {
  return createStore<SidebarState>((set) => ({
    isOpen: initialIsOpen,
    mobileDrawerOpen: false,
    toggle: () =>
      set((s) => {
        const next = !s.isOpen;
        writeCookie(next);
        return { isOpen: next };
      }),
    setOpen: (open) => set({ isOpen: open }),
    setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  }));
}

const SidebarStoreContext = createContext<SidebarStore | null>(null);

export function SidebarStoreProvider({
  initialIsOpen,
  children,
}: {
  initialIsOpen: boolean;
  children: ReactNode;
}) {
  const ref = useRef<SidebarStore | null>(null);
  if (ref.current === null) {
    ref.current = createSidebarStore(initialIsOpen);
  }
  return createElement(
    SidebarStoreContext.Provider,
    { value: ref.current },
    children,
  );
}

export function useSidebarStore<T>(selector: (state: SidebarState) => T): T {
  const store = useContext(SidebarStoreContext);
  if (!store) {
    throw new Error("useSidebarStore must be used within SidebarStoreProvider");
  }
  return useStore(store, selector);
}
