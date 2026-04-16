import Link from "next/link";

export default function WatchNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
        <span className="text-2xl text-text-tertiary">?</span>
      </div>
      <p className="text-sm font-medium text-text-secondary">Video not found</p>
      <p className="text-xs text-text-tertiary mt-1">
        It may have been removed or the link is incorrect
      </p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 text-xs font-medium text-accent-text hover:text-accent transition-base"
      >
        Back to home
      </Link>
    </div>
  );
}
