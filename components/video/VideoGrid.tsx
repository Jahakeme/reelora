"use client";

import { motion } from "framer-motion";
import VideoCard from "./VideoCard";

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

interface VideoGridProps {
  videos: Video[];
  columns?: "default" | "compact";
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function VideoGrid({ videos, columns = "default" }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-text-tertiary"
          >
            <path
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm text-text-secondary font-medium">No videos yet</p>
        <p className="text-xs text-text-tertiary mt-1">Videos will appear here once published</p>
      </div>
    );
  }

  const gridClass =
    columns === "compact"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8";

  return (
    <motion.div
      className={gridClass}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          duration={video.duration}
          views={video.views}
          createdAt={video.createdAt}
          owner={video.owner}
        />
      ))}
    </motion.div>
  );
}
