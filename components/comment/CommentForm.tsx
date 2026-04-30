"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  mentionName?: string | null;
  onSubmit?: (body: string) => void;
  onCancel?: () => void;
}

export default function CommentForm({
  videoId,
  parentId,
  placeholder = "Add a comment...",
  autoFocus = false,
  mentionName,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const { session, requireAuth } = useRequireAuth();
  const user = session?.user;
  const initialBody = mentionName ? `@${mentionName} ` : "";
  const [body, setBody] = useState(initialBody);
  const [focused, setFocused] = useState(autoFocus);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const el = textareaRef.current;
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;

    requireAuth(() => doSubmit());
  }

  async function doSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          videoId,
          ...(parentId ? { parentId } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBody(initialBody);
        setFocused(false);
        onSubmit?.(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setBody(initialBody);
    setFocused(false);
    onCancel?.();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || "You"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-border-default"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
              <span className="text-xs font-medium text-text-muted">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (body.trim() && !submitting) {
                  requireAuth(() => doSubmit());
                }
              }
            }}
            placeholder={placeholder}
            rows={focused ? 3 : 1}
            maxLength={1000}
            className="w-full bg-transparent border-b border-border-default px-0 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 transition-base resize-none"
            autoFocus={autoFocus}
          />

          {focused && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-muted font-mono">
                {body.length}/1000
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!body.trim() || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-text-inverse text-xs font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PaperPlaneRightIcon size={12} weight="bold" />
                  {parentId ? "Reply" : "Comment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
