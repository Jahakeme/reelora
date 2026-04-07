"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  BellIcon,
  UserCircleIcon,
  ListIcon,
  SignOutIcon,
  GearIcon,
  XIcon,
} from "@phosphor-icons/react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-(--navbar-height) bg-surface border-b border-border flex items-center px-4 gap-4">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-surface-hover transition-base focus-ring"
          aria-label="Toggle sidebar"
        >
          <ListIcon size={20} weight="bold" className="text-text-primary" />
        </button>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-text-primary flex items-center justify-center">
            <span className="text-surface text-xs font-bold tracking-tight">R</span>
          </div>
          <span className="text-text-primary font-semibold text-base tracking-tight hidden sm:block">
            Reelora
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div
            className={`flex items-center border rounded-lg overflow-hidden transition-base ${
              searchFocused
                ? "border-accent shadow-[0_0_0_1px_var(--accent)]"
                : "border-border hover:border-text-tertiary"
            }`}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search videos..."
              className="flex-1 bg-transparent px-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="p-1.5 mr-1 rounded hover:bg-surface-hover transition-base"
              >
                <XIcon size={14} className="text-text-secondary" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border-l border-border bg-surface-hover hover:bg-border transition-base"
            >
              <MagnifyingGlassIcon size={16} className="text-text-secondary" />
            </button>
          </div>
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/upload"
          className={`p-2 rounded-lg transition-base focus-ring ${
            isActive("/upload")
              ? "bg-accent-subtle text-accent-text"
              : "hover:bg-surface-hover text-text-secondary"
          }`}
          aria-label="Upload video"
        >
          <VideoCameraIcon size={20} weight="bold" />
        </Link>

        <button
          className="p-2 rounded-lg hover:bg-surface-hover transition-base focus-ring relative text-text-secondary"
          aria-label="Notifications"
        >
          <BellIcon size={20} weight="bold" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-1.5 rounded-lg hover:bg-surface-hover transition-base focus-ring"
            aria-label="Account menu"
          >
            <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center">
              <UserCircleIcon size={20} weight="fill" className="text-text-tertiary" />
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.06)] py-1 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text-primary truncate">Guest User</p>
                <p className="text-xs text-text-secondary mt-0.5">Sign in to access all features</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-base"
                >
                  <GearIcon size={16} />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-base"
                >
                  <SignOutIcon size={16} />
                  <span>Sign in</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
