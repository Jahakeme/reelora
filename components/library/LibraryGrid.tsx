import VideoGrid from "@/components/video/VideoGrid";
import type { LibraryVideo } from "@/lib/data/library";

interface LibraryGridProps {
  title: string;
  description?: string;
  videos: LibraryVideo[];
  emptyTitle: string;
  emptyDescription: string;
}

export default function LibraryGrid({
  title,
  description,
  videos,
  emptyTitle,
  emptyDescription,
}: LibraryGridProps) {
  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}
      </header>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20">
          <p className="text-sm font-medium text-text-secondary">{emptyTitle}</p>
          <p className="text-xs text-text-muted mt-1">{emptyDescription}</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
