"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, ClockIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}:${rm.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear}y ago`;
  if (diffMonth > 0) return `${diffMonth}mo ago`;
  if (diffWeek > 0) return `${diffWeek}w ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}

export default function VideoCard({
  id,
  title,
  thumbnail,
  duration,
  views,
  createdAt,
  owner,
}: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/watch/${id}`} className="group block">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-hover mb-3">
          {thumbnail ? (
            <>
              {!imageLoaded && <div className="absolute inset-0 skeleton" />}
              <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center">
                <EyeIcon size={20} className="text-text-tertiary" />
              </div>
            </div>
          )}

          {/* Duration badge */}
          {duration !== null && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-text-primary/80 text-surface text-xs font-mono rounded">
              {formatDuration(duration)}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-text-primary/0 group-hover:bg-text-primary/5 transition-colors duration-200" />
        </div>

        {/* Info */}
        <div className="flex gap-3">
          {/* Channel avatar */}
          <Link
            href={`/channel/${owner.id}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 mt-0.5"
          >
            {owner.image ? (
              <Image
                src={owner.image}
                alt={owner.name || "Channel"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                <span className="text-xs font-medium text-text-secondary">
                  {owner.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-accent-text transition-colors">
              {title}
            </h3>
            <Link
              href={`/channel/${owner.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-text-secondary hover:text-text-primary transition-base mt-1 block truncate"
            >
              {owner.name || "Unknown"}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <EyeIcon size={12} />
                {formatViews(views)}
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <ClockIcon size={12} />
                {formatTimeAgo(createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
