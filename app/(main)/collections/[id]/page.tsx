import { notFound } from "next/navigation";
import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import LibraryGrid from "@/components/library/LibraryGrid";
import { getCollectionDetail } from "@/lib/data/library";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const collection = await getCollectionDetail(id);

  if (!collection) notFound();

  return (
    <DirectionalTransition>
      <LibraryGrid
        title={collection.name}
        description={`${collection.videos.length} ${collection.videos.length === 1 ? "video" : "videos"}`}
        videos={collection.videos}
        emptyTitle="This collection is empty"
        emptyDescription="Save a video to add it here"
      />
    </DirectionalTransition>
  );
}
