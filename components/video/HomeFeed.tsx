"use client";

import { useState, useEffect, useCallback } from "react";
import { FireIcon, ClockIcon, SparkleIcon } from "@phosphor-icons/react";
import VideoGrid from "./VideoGrid";

interface VideoOwner {
  id: string;
  name: string | null;
  image: string | null;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  createdAt: string;
  owner: VideoOwner;
}

type FeedFilter = "foryou" | "trending" | "recent";

const filters: { key: FeedFilter; label: string; icon: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "regular" }> }[] = [
  { key: "foryou", label: "For you", icon: SparkleIcon },
  { key: "trending", label: "Trending", icon: FireIcon },
  { key: "recent", label: "Recent", icon: ClockIcon },
];

export default function HomeFeed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("foryou");

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos?sort=${activeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
                ? "bg-text-primary text-surface"
                : "bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-border"
            }`}
          >
            <Icon size={16} weight={activeFilter === key ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>

      {/* Video grid */}
      {loading ? (
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
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
