"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FolderSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { toCloudinaryThumbnail } from "@/lib/cloudinary";
import OverflowMenu from "@/components/ui/OverflowMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { CollectionSummary } from "@/lib/data/library";

interface CollectionsViewProps {
  collections: CollectionSummary[];
}

export default function CollectionsView({ collections: initial }: CollectionsViewProps) {
  const [collections, setCollections] = useState(initial);
  const [pendingDelete, setPendingDelete] = useState<CollectionSummary | null>(null);

  function requestDelete(c: CollectionSummary, close: () => void) {
    close();
    setPendingDelete(c);
  }

  async function handleConfirmDelete() {
    const target = pendingDelete;
    if (!target) return;
    const prev = collections;
    setCollections((cs) => cs.filter((x) => x.id !== target.id));
    setPendingDelete(null);
    try {
      const res = await fetch(`/api/collections/${target.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Collection deleted");
    } catch {
      setCollections(prev);
      toast.error("Couldn't delete collection");
    }
  }

  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">
          Collections
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Your saved videos, organized
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center mb-3">
            <FolderSimpleIcon size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No collections yet</p>
          <p className="text-xs text-text-muted mt-1">
            Save a video to create your first collection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collections.map((c) => {
            const thumb = c.preview?.thumbnail
              ? toCloudinaryThumbnail(c.preview.thumbnail)
              : null;
            return (
              <div key={c.id} className="group relative">
                <Link href={`/collections/${c.id}`} className="block">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-bg-hover border border-border-default">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={c.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FolderSimpleIcon size={28} className="text-text-muted" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-bg-base/80 text-text-primary text-[10px] font-mono rounded">
                      {c.itemCount} {c.itemCount === 1 ? "video" : "videos"}
                    </div>
                  </div>
                  <h2 className="mt-2 text-sm font-medium text-text-primary leading-snug line-clamp-1 group-hover:text-amber-100 transition-colors">
                    {c.name}
                  </h2>
                </Link>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <OverflowMenu
                    ariaLabel="Collection options"
                    triggerClassName="p-1.5 rounded-md bg-bg-base/80 text-text-primary hover:bg-bg-base transition-base backdrop-blur-sm"
                  >
                    {(close) => (
                      <button
                        type="button"
                        onClick={() => requestDelete(c, close)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-vermillion-100 hover:bg-vermillion-700/20 transition-base"
                      >
                        <TrashIcon size={14} />
                        Delete
                      </button>
                    )}
                  </OverflowMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.name}"?` : ""}
        description="The videos themselves stay on Reelora — only this collection and its saved entries will be removed."
        confirmLabel="Delete collection"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
