"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareNetworkIcon,
  DotsThreeIcon,
  UserPlusIcon,
  CheckIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import VideoPlayer from "./VideoPlayer";
import CommentList from "@/components/comment/CommentList";

interface VideoOwner {
  id: string;
  name: string | null;
  image: string | null;
  subscriberCount: number;
}

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  tags: string[];
  createdAt: string;
  owner: VideoOwner;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
  isSubscribed: boolean;
}

interface RelatedVideo {
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

interface WatchViewProps {
  videoId: string;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function WatchView({ videoId }: WatchViewProps) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [related, setRelated] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [currentVote, setCurrentVote] = useState<"LIKE" | "DISLIKE" | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true);
      try {
        const [videoRes, relatedRes] = await Promise.all([
          fetch(`/api/videos/${videoId}`),
          fetch(`/api/videos?exclude=${videoId}&limit=8`),
        ]);

        if (videoRes.ok) {
          const data = await videoRes.json();
          setVideo(data);
          setCurrentVote(data.userVote);
          setLikeCount(data.likes);
          setDislikeCount(data.dislikes);
          setSubscribed(data.isSubscribed);
        }

        if (relatedRes.ok) {
          const data = await relatedRes.json();
          setRelated(data.videos || []);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  async function handleVote(type: "LIKE" | "DISLIKE") {
    if (!video) return;
    const prevVote = currentVote;
    const prevLikes = likeCount;
    const prevDislikes = dislikeCount;

    if (currentVote === type) {
      setCurrentVote(null);
      if (type === "LIKE") setLikeCount((c) => c - 1);
      else setDislikeCount((c) => c - 1);
    } else {
      if (currentVote === "LIKE") setLikeCount((c) => c - 1);
      if (currentVote === "DISLIKE") setDislikeCount((c) => c - 1);
      setCurrentVote(type);
      if (type === "LIKE") setLikeCount((c) => c + 1);
      else setDislikeCount((c) => c + 1);
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id, type }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCurrentVote(prevVote);
      setLikeCount(prevLikes);
      setDislikeCount(prevDislikes);
    }
  }

  async function handleSubscribe() {
    if (!video) return;
    const prev = subscribed;
    setSubscribed(!subscribed);

    try {
      if (prev) {
        await fetch(`/api/subscriptions/${video.owner.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId: video.owner.id }),
        });
      }
    } catch {
      setSubscribed(prev);
    }
  }

  if (loading) {
    return (
      <div className="max-w-350 mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="aspect-video skeleton rounded-lg" />
            <div className="h-6 skeleton w-3/4" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full skeleton" />
              <div className="space-y-2 flex-1">
                <div className="h-4 skeleton w-32" />
                <div className="h-3 skeleton w-20" />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-90 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-40 aspect-video skeleton rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 skeleton w-full" />
                  <div className="h-3 skeleton w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-text-secondary font-medium">Video not found</p>
        <Link href="/" className="text-xs text-accent-text hover:text-accent mt-2 transition-base">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-350 mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Player */}
          <VideoPlayer src={video.url} poster={video.thumbnail || undefined} title={video.title} />

          {/* Title */}
          <h1 className="text-lg font-semibold text-text-primary tracking-tight mt-4 leading-snug">
            {video.title}
          </h1>

          {/* Channel + actions row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              <Link href={`/channel/${video.owner.id}`}>
                {video.owner.image ? (
                  <Image
                    src={video.owner.image}
                    alt={video.owner.name || "Channel"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                    <span className="text-sm font-medium text-text-secondary">
                      {video.owner.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </Link>
              <div>
                <Link
                  href={`/channel/${video.owner.id}`}
                  className="text-sm font-medium text-text-primary hover:underline"
                >
                  {video.owner.name || "Unknown"}
                </Link>
                <p className="text-xs text-text-tertiary">
                  {formatSubscribers(video.owner.subscriberCount)} subscribers
                </p>
              </div>
              <button
                onClick={handleSubscribe}
                className={`ml-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-base active:scale-[0.98] ${
                  subscribed
                    ? "bg-surface-hover text-text-secondary border border-border hover:bg-border"
                    : "bg-text-primary text-surface hover:bg-[#333333]"
                }`}
              >
                {subscribed ? (
                  <>
                    <CheckIcon size={14} weight="bold" />
                    Subscribed
                  </>
                ) : (
                  <>
                    <UserPlusIcon size={14} weight="bold" />
                    Subscribe
                  </>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                <button
                  onClick={() => handleVote("LIKE")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-base ${
                    currentVote === "LIKE"
                      ? "bg-accent-subtle text-accent-text"
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <ThumbsUpIcon size={16} weight={currentVote === "LIKE" ? "fill" : "regular"} />
                  <span className="font-mono">{likeCount}</span>
                </button>
                <div className="w-px h-6 bg-border" />
                <button
                  onClick={() => handleVote("DISLIKE")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs transition-base ${
                    currentVote === "DISLIKE"
                      ? "bg-danger-subtle text-danger-text"
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <ThumbsDownIcon size={16} weight={currentVote === "DISLIKE" ? "fill" : "regular"} />
                </button>
              </div>

              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-border rounded-full text-xs font-medium text-text-secondary hover:bg-surface-hover transition-base">
                <ShareNetworkIcon size={16} />
                Share
              </button>

              <button className="p-1.5 border border-border rounded-full text-text-secondary hover:bg-surface-hover transition-base">
                <DotsThreeIcon size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 p-4 bg-surface-hover rounded-xl">
            <div className="flex items-center gap-3 text-xs text-text-secondary font-medium mb-2">
              <span className="flex items-center gap-1">
                <EyeIcon size={14} />
                {formatViews(video.views)}
              </span>
              <span>{formatDate(video.createdAt)}</span>
            </div>

            {video.description && (
              <div className={`${descExpanded ? "" : "line-clamp-3"}`}>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}

            {video.description && video.description.length > 200 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-xs font-medium text-text-secondary hover:text-text-primary mt-2 transition-base"
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            )}

            {video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {video.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 bg-accent-subtle text-accent-text text-xs font-medium rounded-full hover:bg-accent/10 transition-base"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mt-8 border-t border-border pt-6">
            <CommentList videoId={videoId} />
          </div>
        </div>

        {/* Related videos sidebar */}
        <aside className="w-full lg:w-90 shrink-0">
          <h3 className="text-sm font-semibold text-text-primary mb-4 tracking-tight">
            Related videos
          </h3>
          {related.length > 0 ? (
            <div className="space-y-4">
              {related.map((rv) => (
                <Link key={rv.id} href={`/watch/${rv.id}`} className="flex gap-3 group">
                  <div className="relative w-40 shrink-0 aspect-video rounded-lg overflow-hidden bg-surface-hover">
                    {rv.thumbnail ? (
                      <Image
                        src={rv.thumbnail}
                        alt={rv.title}
                        fill
                        sizes="160px"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <EyeIcon size={16} className="text-text-tertiary" />
                      </div>
                    )}
                    {rv.duration !== null && (
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-text-primary/80 text-surface text-[10px] font-mono rounded">
                        {Math.floor(rv.duration / 60)}:{(rv.duration % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h4 className="text-sm font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-accent-text transition-colors">
                      {rv.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {rv.owner.name || "Unknown"}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {rv.views >= 1000 ? `${(rv.views / 1000).toFixed(1)}K` : rv.views} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">No related videos</p>
          )}
        </aside>
      </div>
    </div>
  );
}
