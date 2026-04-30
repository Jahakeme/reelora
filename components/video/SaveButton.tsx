"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BookmarkSimpleIcon, PlusIcon, CheckIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface CollectionEntry {
  id: string;
  name: string;
  itemCount: number;
  containsVideo: boolean;
}

interface SaveButtonProps {
  videoId: string;
}

const DEFAULT_COLLECTION_NAME = "Watch later";

export default function SaveButton({ videoId }: SaveButtonProps) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isSaved = collections.some((c) => c.containsVideo);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections?videoId=${encodeURIComponent(videoId)}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      let items: CollectionEntry[] = data.items ?? [];

      if (items.length === 0) {
        const createRes = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: DEFAULT_COLLECTION_NAME }),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          items = [
            {
              id: created.collection.id,
              name: created.collection.name,
              itemCount: 0,
              containsVideo: false,
            },
          ];
        }
      }

      setCollections(items);
    } catch {
      toast.error("Couldn't load your collections");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleClick() {
    requireAuth(() => {
      setOpen((prev) => {
        if (!prev) loadCollections();
        return !prev;
      });
    });
  }

  async function toggleMembership(c: CollectionEntry) {
    setBusyId(c.id);
    const next = !c.containsVideo;
    setCollections((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? {
              ...x,
              containsVideo: next,
              itemCount: x.itemCount + (next ? 1 : -1),
            }
          : x,
      ),
    );

    try {
      const res = await fetch(
        next
          ? `/api/collections/${c.id}/items`
          : `/api/collections/${c.id}/items?videoId=${encodeURIComponent(videoId)}`,
        {
          method: next ? "POST" : "DELETE",
          headers: next ? { "Content-Type": "application/json" } : undefined,
          body: next ? JSON.stringify({ videoId }) : undefined,
        },
      );
      if (!res.ok) throw new Error();
      toast.success(next ? `Saved to ${c.name}` : `Removed from ${c.name}`);
    } catch {
      setCollections((prev) =>
        prev.map((x) =>
          x.id === c.id
            ? {
                ...x,
                containsVideo: !next,
                itemCount: x.itemCount + (next ? -1 : 1),
              }
            : x,
        ),
      );
      toast.error("Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const itemRes = await fetch(`/api/collections/${data.collection.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const added = itemRes.ok;

      setCollections((prev) => [
        {
          id: data.collection.id,
          name: data.collection.name,
          itemCount: added ? 1 : 0,
          containsVideo: added,
        },
        ...prev,
      ]);
      setNewName("");
      toast.success(added ? `Saved to ${trimmed}` : "Collection created");
    } catch {
      toast.error("Couldn't create collection");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 border border-border-default rounded-full text-xs font-medium transition-base ${
          isSaved
            ? "bg-amber-700 text-amber-100 border-amber-700"
            : "text-text-secondary hover:bg-bg-hover"
        }`}
      >
        <BookmarkSimpleIcon size={16} weight={isSaved ? "fill" : "regular"} />
        {isSaved ? "Saved" : "Save"}
      </button>

      <AnimatePresence>
        {open && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-72 z-50 origin-top-right bg-bg-surface border border-border-default rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border-default">
              <p className="text-xs font-semibold text-text-primary tracking-tight">
                Save to...
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {loading ? (
                <div className="px-4 py-3 text-xs text-text-muted">Loading...</div>
              ) : collections.length === 0 ? (
                <div className="px-4 py-3 text-xs text-text-muted">No collections yet</div>
              ) : (
                collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleMembership(c)}
                    disabled={busyId === c.id}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-hover transition-base disabled:opacity-50"
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        c.containsVideo
                          ? "bg-amber-500 border-amber-500"
                          : "border-border-default"
                      }`}
                    >
                      {c.containsVideo && (
                        <CheckIcon size={10} weight="bold" className="text-text-inverse" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-medium text-text-primary truncate">
                        {c.name}
                      </span>
                      <span className="block text-[10px] text-text-muted font-mono">
                        {c.itemCount} {c.itemCount === 1 ? "video" : "videos"}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>

            <form
              onSubmit={handleCreate}
              className="flex items-center gap-2 px-3 py-2 border-t border-border-default"
            >
              <PlusIcon size={14} className="text-text-muted shrink-0" />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New collection"
                maxLength={100}
                disabled={creating}
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              {newName.trim() && (
                <button
                  type="submit"
                  disabled={creating}
                  className="px-2 py-1 text-[10px] font-semibold text-amber-100 bg-amber-700 rounded-md hover:bg-amber-500 hover:text-text-inverse transition-base disabled:opacity-50"
                >
                  Create
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
