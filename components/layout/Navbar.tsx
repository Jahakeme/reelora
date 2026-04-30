"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  BellIcon,
  UserCircleIcon,
  SignOutIcon,
  SignInIcon,
  GearIcon,
  XIcon,
} from "@phosphor-icons/react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user;

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
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{ viewTransitionName: "persistent-nav" }} className="fixed top-0 left-0 right-0 z-40 h-(--navbar-height) bg-bg-surface border-b border-border-default flex items-center px-4 gap-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
            <span className="text-text-inverse text-xs font-bold tracking-tight">R</span>
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
                ? "border-amber-500 shadow-[0_0_0_1px_var(--amber-500)]"
                : "border-border-default hover:border-text-muted"
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
              className="flex-1 bg-transparent px-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="p-1.5 mr-1 rounded hover:bg-bg-hover transition-base"
              >
                <XIcon size={14} className="text-text-secondary" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border-l border-border-default bg-bg-hover hover:bg-border-default transition-base"
            >
              <MagnifyingGlassIcon size={16} className="text-text-secondary" />
            </button>
          </div>
        </form>
      </div>

      {/* Right: Actions (hidden on mobile — covered by bottom nav) */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        <Link
          href="/upload"
          className={`p-2 rounded-lg transition-base focus-ring ${
            isActive("/upload")
              ? "bg-amber-700 text-amber-100"
              : "hover:bg-bg-hover text-text-secondary"
          }`}
          aria-label="Upload video"
        >
          <VideoCameraIcon size={20} weight="bold" />
        </Link>

        {user && (
          <button
            className="p-2 rounded-lg hover:bg-bg-hover transition-base focus-ring relative text-text-secondary"
            aria-label="Notifications"
          >
            <BellIcon size={20} weight="bold" />
          </button>
        )}

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-base focus-ring"
            aria-label="Account menu"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "Profile"}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover border border-border-default"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
                {user ? (
                  <span className="text-xs font-medium text-text-secondary">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                ) : (
                  <UserCircleIcon size={20} weight="fill" className="text-text-muted" />
                )}
              </div>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-bg-surface border border-border-default rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.06)] py-1 z-50">
              <div className="px-4 py-3 border-b border-border-default">
                {user ? (
                  <>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {user.email}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-primary truncate">Guest</p>
                    <p className="text-xs text-text-secondary mt-0.5">Sign in to access all features</p>
                  </>
                )}
              </div>

              <div className="py-1">
                {user && (
                  <>
                    <Link
                      href={`/channel/${user.id}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover transition-base"
                    >
                      <UserCircleIcon size={16} />
                      <span>Your channel</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover transition-base"
                    >
                      <GearIcon size={16} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover transition-base w-full text-left"
                    >
                      <SignOutIcon size={16} />
                      <span>Sign out</span>
                    </button>
                  </>
                )}
                {!user && (
                  <Link
                    href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover transition-base"
                  >
                    <SignInIcon size={16} />
                    <span>Sign in</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
