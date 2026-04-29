"use client";

import { useEffect } from "react";
import { ArrowCounterClockwiseIcon, HouseIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center mb-4">
        <span className="text-2xl text-text-muted">!</span>
      </div>
      <p className="text-sm font-medium text-text-secondary">
        Something went wrong
      </p>
      <p className="text-xs text-text-muted mt-1">
        An unexpected error occurred while loading this page
      </p>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-text-primary bg-bg-hover border border-border-default rounded-lg hover:bg-border-default transition-base active:scale-[0.98]"
        >
          <ArrowCounterClockwiseIcon size={14} weight="bold" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-100 hover:text-amber-500 transition-base"
        >
          <HouseIcon size={14} weight="bold" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
