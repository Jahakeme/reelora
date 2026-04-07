"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUpIcon, ThumbsDownIcon, ChatCircleIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import CommentForm from "./CommentForm";

interface ReplyAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

interface Reply {
  id: string;
  body: string;
  author: ReplyAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
}

interface ReplyListProps {
  replies: Reply[];
  videoId: string;
  parentId: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffDay > 365) return `${Math.floor(diffDay / 365)}y ago`;
  if (diffDay > 30) return `${Math.floor(diffDay / 30)}mo ago`;
  if (diffDay > 7) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}

function ReplyItem({
  reply,
  videoId,
  parentId,
}: {
  reply: Reply;
  videoId: string;
  parentId: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentVote, setCurrentVote] = useState(reply.userVote);
  const [likeCount, setLikeCount] = useState(reply.likes);
  const [dislikeCount, setDislikeCount] = useState(reply.dislikes);

  async function handleVote(type: "LIKE" | "DISLIKE") {
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
        body: JSON.stringify({ commentId: reply.id, type }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCurrentVote(prevVote);
      setLikeCount(prevLikes);
      setDislikeCount(prevDislikes);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 group"
    >
      <Link href={`/channel/${reply.author.id}`} className="shrink-0 mt-0.5">
        {reply.author.image ? (
          <Image
            src={reply.author.image}
            alt={reply.author.name || "User"}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center">
            <span className="text-[10px] font-medium text-text-secondary">
              {reply.author.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/channel/${reply.author.id}`}
            className="text-xs font-medium text-text-primary hover:underline"
          >
            {reply.author.name || "Unknown"}
          </Link>
          <span className="text-xs text-text-tertiary">{formatTimeAgo(reply.createdAt)}</span>
        </div>

        <p className="text-sm text-text-primary mt-0.5 leading-relaxed whitespace-pre-wrap wrap-break-word">
          {reply.body}
        </p>

        <div className="flex items-center gap-1 mt-1.5">
          <button
            onClick={() => handleVote("LIKE")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-base ${
              currentVote === "LIKE"
                ? "text-accent-text bg-accent-subtle"
                : "text-text-tertiary hover:text-text-secondary hover:bg-surface-hover"
            }`}
          >
            <ThumbsUpIcon size={12} weight={currentVote === "LIKE" ? "fill" : "regular"} />
            {likeCount > 0 && <span className="font-mono">{likeCount}</span>}
          </button>

          <button
            onClick={() => handleVote("DISLIKE")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-base ${
              currentVote === "DISLIKE"
                ? "text-danger-text bg-danger-subtle"
                : "text-text-tertiary hover:text-text-secondary hover:bg-surface-hover"
            }`}
          >
            <ThumbsDownIcon size={12} weight={currentVote === "DISLIKE" ? "fill" : "regular"} />
          </button>

          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-text-tertiary hover:text-text-secondary hover:bg-surface-hover transition-base"
          >
            <ChatCircleIcon size={12} />
            Reply
          </button>
        </div>

        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              videoId={videoId}
              parentId={parentId}
              placeholder={`Reply to ${reply.author.name || "User"}...`}
              autoFocus
              onCancel={() => setShowReplyForm(false)}
              onSubmit={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ReplyList({ replies, videoId, parentId }: ReplyListProps) {
  if (replies.length === 0) return null;

  return (
    <div className="space-y-4 pl-1 border-l-2 border-border ml-1">
      <div className="pl-4 space-y-4">
        {replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            videoId={videoId}
            parentId={parentId}
          />
        ))}
      </div>
    </div>
  );
}
