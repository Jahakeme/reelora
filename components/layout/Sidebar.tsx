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
} from "@phosphor-icons/react";

interface SidebarProps {
  isOpen: boolean;
}

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

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  function NavLink({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "regular" }>;
  }) {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-base ${
          active
            ? "bg-surface-hover text-text-primary font-medium"
            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        }`}
      >
        <Icon size={18} weight={active ? "fill" : "regular"} />
        {isOpen && <span className="truncate">{label}</span>}
      </Link>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-(--navbar-height) bottom-0 z-30 bg-surface border-r border-border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden ${
        isOpen ? "w-(--sidebar-width)" : "w-16"
      }`}
    >
      <div className="flex flex-col p-2 gap-0.5">
        {/* Main */}
        <div className="mb-2">
          {mainLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        {/* Library */}
        {isOpen && (
          <div className="pt-3 border-t border-border">
            <p className="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Library
            </p>
          </div>
        )}
        <div className="mb-2">
          {libraryLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        {/* Categories */}
        {isOpen && (
          <div className="pt-3 border-t border-border">
            <p className="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Categories
            </p>
          </div>
        )}
        <div>
          {categoryLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="mt-6 px-3 py-4 border-t border-border">
            <p className="text-xs text-text-tertiary leading-relaxed">
              About &middot; Press &middot; Copyright &middot; Contact &middot; Creators
            </p>
            <p className="text-xs text-text-tertiary mt-2 font-mono">Reelora 2026</p>
          </div>
        )}
      </div>
    </aside>
  );
}
