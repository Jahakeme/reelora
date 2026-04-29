"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { FireIcon, ClockIcon } from "@phosphor-icons/react";
import { useVideos } from "@/hooks/useVideos";
import VideoGrid from "./VideoGrid";

type FeedFilter = "trending" | "new";

const filters: { key: FeedFilter; label: string; icon: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "regular" }> }[] = [
  { key: "trending", label: "Trending", icon: FireIcon },
  { key: "new", label: "New", icon: ClockIcon },
];

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-video skeleton rounded-lg" />
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full skeleton shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton w-full" />
              <div className="h-3 skeleton w-2/3" />
              <div className="h-3 skeleton w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFeed() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("trending");
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useVideos(activeFilter);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "400px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const allVideos = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="w-full max-w-350 mx-auto">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-base ${
              activeFilter === key
                ? "bg-amber-500 text-text-inverse"
                : "bg-bg-hover text-text-secondary hover:text-text-primary hover:bg-border-default"
            }`}
          >
            <Icon size={16} weight={activeFilter === key ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>

      {/* Video grid */}
      {isLoading ? (
        <VideoGridSkeleton />
      ) : (
        <>
          <VideoGrid videos={allVideos} />

          {/* Infinite scroll sentinel */}
          {hasNextPage && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="w-6 h-6 border-2 border-border-default border-t-text-secondary rounded-full animate-spin" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
