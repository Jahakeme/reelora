"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlusIcon, CheckIcon, BellIcon, EyeIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import VideoGrid from "@/components/video/VideoGrid";
import { useSubscription, useSubscribeMutation } from "@/hooks/useSubscription";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface ChannelData {
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
  channel: ChannelData;
  videos: Video[];
}

type TabKey = "videos" | "about";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function ChannelView({ channel, videos }: ChannelViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("videos");
  const { session, requireAuth } = useRequireAuth();
  const isOwnChannel = session?.user?.id === channel.id;

  const { data: subData } = useSubscription(channel.id);
  const subscribeMutation = useSubscribeMutation(channel.id);
  const subscribed = subData?.subscribed ?? false;

  return (
    <div className="max-w-350 mx-auto">
      {/* Channel header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border-default"
      >
        {/* Avatar */}
        {channel.image ? (
          <Image
            src={channel.image}
            alt={channel.name || "Channel"}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border border-border-default"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
            <span className="text-2xl font-semibold text-text-secondary">
              {channel.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            {channel.name || "Unknown Channel"}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span className="font-mono">{formatCount(channel.subscriberCount)} subscribers</span>
            <span>&middot;</span>
            <span className="font-mono">{formatCount(channel.videoCount)} videos</span>
          </div>

          {!isOwnChannel && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => requireAuth(() => subscribeMutation.mutate(!subscribed))}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-base active:scale-[0.98] ${
                  subscribed
                    ? "bg-bg-hover text-text-secondary border border-border-default hover:bg-border-default"
                    : "bg-amber-500 text-text-inverse hover:bg-amber-300"
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
                <button className="p-2 rounded-full border border-border-default hover:bg-bg-hover transition-base text-text-secondary">
                  <BellIcon size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mt-4 border-b border-border-default">
        {(["videos", "about"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize transition-base border-b-2 ${
              activeTab === tab
                ? "text-text-primary border-text-primary"
                : "text-text-muted border-transparent hover:text-text-secondary"
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
              <EyeIcon size={16} className="text-text-muted" />
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
