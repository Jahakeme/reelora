"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUpIcon, ThumbsDownIcon, ChatCircleIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import CommentForm from "./CommentForm";
import ReplyList from "./ReplyList";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

interface Reply {
  id: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
}

interface CommentItemProps {
  id: string;
  body: string;
  author: CommentAuthor;
  videoId: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
  replies: Reply[];
  replyCount: number;
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

export default function CommentItem({
  id,
  body,
  author,
  videoId,
  createdAt,
  likes,
  dislikes,
  userVote,
  replies,
  replyCount,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [likeCount, setLikeCount] = useState(likes);
  const [dislikeCount, setDislikeCount] = useState(dislikes);

  async function handleVote(type: "LIKE" | "DISLIKE") {
    const prevVote = currentVote;
    const prevLikes = likeCount;
    const prevDislikes = dislikeCount;

    // Optimistic update
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
        body: JSON.stringify({ commentId: id, type }),
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/channel/${author.id}`} className="shrink-0 mt-0.5">
          {author.image ? (
            <Image
              src={author.image}
              alt={author.name || "User"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-border-default"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
              <span className="text-xs font-medium text-text-secondary">
                {author.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link
              href={`/channel/${author.id}`}
              className="text-xs font-medium text-text-primary hover:underline"
            >
              {author.name || "Unknown"}
            </Link>
            <span className="text-xs text-text-muted">{formatTimeAgo(createdAt)}</span>
          </div>

          {/* Body */}
          <p className="text-sm text-text-primary mt-1 leading-relaxed whitespace-pre-wrap wrap-break-word">
            {body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => handleVote("LIKE")}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-base ${
                currentVote === "LIKE"
                  ? "text-amber-100 bg-amber-700"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <ThumbsUpIcon size={14} weight={currentVote === "LIKE" ? "fill" : "regular"} />
              {likeCount > 0 && <span className="font-mono">{likeCount}</span>}
            </button>

            <button
              onClick={() => handleVote("DISLIKE")}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-base ${
                currentVote === "DISLIKE"
                  ? "text-vermillion-100 bg-vermillion-700"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <ThumbsDownIcon size={14} weight={currentVote === "DISLIKE" ? "fill" : "regular"} />
              {dislikeCount > 0 && <span className="font-mono">{dislikeCount}</span>}
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-base"
            >
              <ChatCircleIcon size={14} />
              Reply
            </button>

            <button
              className="p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-base opacity-0 group-hover:opacity-100"
              aria-label="More options"
            >
              <DotsThreeIcon size={16} weight="bold" />
            </button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                videoId={videoId}
                parentId={id}
                placeholder="Add a reply..."
                autoFocus
                onCancel={() => setShowReplyForm(false)}
                onSubmit={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies */}
          {replyCount > 0 && (
            <div className="mt-2">
              {!showReplies ? (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-xs font-medium text-amber-100 hover:text-amber-500 transition-base"
                >
                  View {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowReplies(false)}
                    className="text-xs font-medium text-amber-100 hover:text-amber-500 transition-base mb-3"
                  >
                    Hide replies
                  </button>
                  <ReplyList replies={replies} videoId={videoId} parentId={id} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
