import {
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";

export interface VideoOwner {
  id: string;
  name: string | null;
  image: string | null;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  ownerId: string;
  createdAt: string;
  owner?: VideoOwner;
}

interface VideosPage {
  items: VideoItem[];
  nextCursor: string | null;
}

async function fetchVideos(sort: string, cursor?: string): Promise<VideosPage> {
  const params = new URLSearchParams({ sort });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/videos?${params}`);
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

export function useVideos(sort: string) {
  return useInfiniteQuery<
    VideosPage,
    Error,
    InfiniteData<VideosPage>,
    [string, string],
    string | undefined
  >({
    queryKey: ["videos", sort],
    queryFn: ({ pageParam }) => fetchVideos(sort, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
