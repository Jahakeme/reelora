"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatCircleIcon, ArrowDownIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

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

interface Comment {
  id: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
  replies: Reply[];
  replyCount: number;
}

interface CommentListProps {
  videoId: string;
}

type SortOption = "newest" | "top";

export default function CommentList({ videoId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("newest");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchComments = useCallback(
    async (append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          videoId,
          sort,
          limit: "20",
        });
        if (append && cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/comments?${params}`);
        if (res.ok) {
          const data = await res.json();
          const items = (data.items ?? []).map((c: Record<string, unknown>) => ({
            ...c,
            likes: c.likes ?? 0,
            dislikes: c.dislikes ?? 0,
            userVote: c.userVote ?? null,
            replies: c.replies ?? [],
            replyCount: c.replyCount ?? 0,
          }));
          if (append) {
            setComments((prev) => [...prev, ...items]);
          } else {
            setComments(items);
          }
          setCursor(data.nextCursor ?? null);
          setHasMore(!!data.nextCursor);
          if (!append) setTotalCount(items.length);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [videoId, sort, cursor]
  );

  useEffect(() => {
    setCursor(null);
    fetchComments(false);
  }, [videoId, sort]);

  function handleNewComment() {
    setCursor(null);
    fetchComments(false);
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-primary tracking-tight">
            Comments
          </h2>
          {totalCount > 0 && (
            <span className="text-xs font-mono text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <FunnelSimpleIcon size={14} className="text-text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-transparent text-xs font-medium text-text-secondary cursor-pointer focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="top">Top</option>
          </select>
        </div>
      </div>

      {/* Comment form */}
      <div className="mb-8">
        <CommentForm videoId={videoId} onSubmit={handleNewComment} />
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-4 w-3/4 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center mb-3">
            <ChatCircleIcon size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No comments yet</p>
          <p className="text-xs text-text-muted mt-1">Start the conversation</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                id={comment.id}
                body={comment.body}
                author={comment.author}
                videoId={videoId}
                createdAt={comment.createdAt}
                likes={comment.likes}
                dislikes={comment.dislikes}
                userVote={comment.userVote}
                replies={comment.replies}
                replyCount={comment.replyCount}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchComments(true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-base disabled:opacity-50"
              >
                <ArrowDownIcon size={14} />
                {loadingMore ? "Loading..." : "Load more comments"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
