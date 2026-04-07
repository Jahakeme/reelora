"use client";

import { useState, useRef } from "react";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit?: (body: string) => void;
  onCancel?: () => void;
}

export default function CommentForm({
  videoId,
  parentId,
  placeholder = "Add a comment...",
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [focused, setFocused] = useState(autoFocus);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          videoId,
          parentId: parentId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBody("");
        setFocused(false);
        onSubmit?.(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setBody("");
    setFocused(false);
    onCancel?.();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center">
            <span className="text-xs font-medium text-text-tertiary">G</span>
          </div>
        </div>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            rows={focused ? 3 : 1}
            maxLength={1000}
            className="w-full bg-transparent border-b border-border px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-base resize-none"
            autoFocus={autoFocus}
          />

          {focused && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-tertiary font-mono">
                {body.length}/1000
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!body.trim() || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-text-primary text-surface text-xs font-medium rounded-md hover:bg-[#333333] active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
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
