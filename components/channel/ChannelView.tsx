"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserPlusIcon, CheckIcon, BellIcon, EyeIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import VideoGrid from "@/components/video/VideoGrid";

interface ChannelOwner {
  id: string;
  name: string | null;
  image: string | null;
  subscriberCount: number;
  videoCount: number;
  createdAt: string;
}

interface Video {
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

interface ChannelViewProps {
  channelId: string;
}

type TabKey = "videos" | "about";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function ChannelView({ channelId }: ChannelViewProps) {
  const [channel, setChannel] = useState<ChannelOwner | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("videos");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchChannel() {
      setLoading(true);
      try {
        const [channelRes, videosRes] = await Promise.all([
          fetch(`/api/users/${channelId}`),
          fetch(`/api/videos?ownerId=${channelId}`),
        ]);

        if (channelRes.ok) {
          const data = await channelRes.json();
          setChannel(data);
        }

        if (videosRes.ok) {
          const data = await videosRes.json();
          setVideos(data.videos || []);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchChannel();
  }, [channelId]);

  async function handleSubscribe() {
    const prev = subscribed;
    setSubscribed(!subscribed);

    try {
      if (prev) {
        await fetch(`/api/subscriptions/${channelId}`, { method: "DELETE" });
      } else {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId }),
        });
      }
    } catch {
      setSubscribed(prev);
    }
  }

  if (loading) {
    return (
      <div className="max-w-350 mx-auto space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full skeleton" />
          <div className="space-y-3">
            <div className="h-6 skeleton w-48" />
            <div className="h-4 skeleton w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video skeleton rounded-lg" />
              <div className="h-4 skeleton w-3/4" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-text-secondary font-medium">Channel not found</p>
        <Link href="/" className="text-xs text-accent-text hover:text-accent mt-2 transition-base">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-350 mx-auto">
      {/* Channel header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border"
      >
        {/* Avatar */}
        {channel.image ? (
          <Image
            src={channel.image}
            alt={channel.name || "Channel"}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-surface-hover border border-border flex items-center justify-center">
            <span className="text-2xl font-semibold text-text-secondary">
              {channel.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            {channel.name || "Unknown Channel"}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
            <span className="font-mono">{formatCount(channel.subscriberCount)} subscribers</span>
            <span>&middot;</span>
            <span className="font-mono">{formatCount(channel.videoCount)} videos</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-base active:scale-[0.98] ${
                subscribed
                  ? "bg-surface-hover text-text-secondary border border-border hover:bg-border"
                  : "bg-text-primary text-surface hover:bg-[#333333]"
              }`}
            >
              {subscribed ? (
                <>
                  <CheckIcon size={16} weight="bold" />
                  Subscribed
                </>
              ) : (
                <>
                  <UserPlusIcon size={16} weight="bold" />
                  Subscribe
                </>
              )}
            </button>
            {subscribed && (
              <button className="p-2 rounded-full border border-border hover:bg-surface-hover transition-base text-text-secondary">
                <BellIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mt-4 border-b border-border">
        {(["videos", "about"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize transition-base border-b-2 ${
              activeTab === tab
                ? "text-text-primary border-text-primary"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "videos" && (
          <VideoGrid videos={videos} columns="compact" />
        )}

        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-lg space-y-4"
          >
            <div className="flex items-center gap-3 text-sm">
              <EyeIcon size={16} className="text-text-tertiary" />
              <span className="text-text-secondary">
                Joined {new Date(channel.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              <p>{formatCount(channel.subscriberCount)} subscribers</p>
              <p>{formatCount(channel.videoCount)} videos published</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
