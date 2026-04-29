"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  CompassIcon,
  ClockIcon,
  ThumbsUpIcon,
  FolderIcon,
  FireIcon,
  MusicNoteIcon,
  GameControllerIcon,
  NewspaperIcon,
  TrophyIcon,
  ListIcon,
} from "@phosphor-icons/react";
import { useSidebarStore } from "@/stores/sidebar";

const mainLinks = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
];

const libraryLinks = [
  { href: "/history", label: "History", icon: ClockIcon },
  { href: "/liked", label: "Liked videos", icon: ThumbsUpIcon },
  { href: "/collections", label: "Collections", icon: FolderIcon },
];

const categoryLinks = [
  { href: "/trending", label: "Trending", icon: FireIcon },
  { href: "/music", label: "Music", icon: MusicNoteIcon },
  { href: "/gaming", label: "Gaming", icon: GameControllerIcon },
  { href: "/news", label: "News", icon: NewspaperIcon },
  { href: "/sports", label: "Sports", icon: TrophyIcon },
];

type NavLinkItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "regular" }>;
};

function NavLink({
  item,
  active,
  collapseClass,
  onNavigate,
}: {
  item: NavLinkItem;
  active: boolean;
  collapseClass: string;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-base ${
        active
          ? "bg-bg-hover text-text-primary font-medium"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
    >
      <Icon size={18} weight={active ? "fill" : "regular"} />
      <span className={`truncate ${collapseClass}`}>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((s) => s.isOpen);
  const toggle = useSidebarStore((s) => s.toggle);
  const mobileDrawerOpen = useSidebarStore((s) => s.mobileDrawerOpen);
  const setMobileDrawerOpen = useSidebarStore((s) => s.setMobileDrawerOpen);

  // Labels/sections collapse only on desktop when the rail is collapsed.
  // On mobile (drawer view), the full expanded layout is always rendered.
  const collapseClass = isOpen ? "" : "md:hidden";

  function handleToggleClick() {
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
    else toggle();
  }

  function handleNavigate() {
    setMobileDrawerOpen(false);
  }

  return (
    <aside
      style={{ viewTransitionName: "persistent-sidebar" }}
      className={`fixed left-0 top-(--navbar-height) bottom-0 z-30 bg-bg-surface border-r border-border-default transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden w-(--sidebar-width) ${
        mobileDrawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      } md:translate-x-0 md:shadow-none ${
        isOpen ? "md:w-(--sidebar-width)" : "md:w-16"
      }`}
    >
      <div className="flex flex-col p-2 gap-0.5">
        {/* Toggle */}
        <button
          onClick={handleToggleClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-bg-hover transition-base focus-ring mb-1"
          aria-label="Toggle sidebar"
        >
          <ListIcon size={18} weight="bold" />
          <span className={`text-sm ${collapseClass}`}>Menu</span>
        </button>

        {/* Main */}
        <div className="mb-2">
          {mainLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapseClass={collapseClass}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Library */}
        <div className={`pt-3 border-t border-border-default ${collapseClass}`}>
          <p className="px-3 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
            Library
          </p>
        </div>
        <div className="mb-2">
          {libraryLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapseClass={collapseClass}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Categories */}
        <div className={`pt-3 border-t border-border-default ${collapseClass}`}>
          <p className="px-3 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
            Categories
          </p>
        </div>
        <div>
          {categoryLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapseClass={collapseClass}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-6 px-3 py-4 border-t border-border-default ${collapseClass}`}>
          <p className="text-xs text-text-muted leading-relaxed">
            About &middot; Press &middot; Copyright &middot; Contact &middot; Creators
          </p>
          <p className="text-xs text-text-muted mt-2 font-mono">Reelora 2026</p>
        </div>
      </div>
    </aside>
  );
}
