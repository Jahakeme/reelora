import { useQuery } from "@tanstack/react-query";

interface VideoOwner {
  id: string;
  name: string | null;
  image: string | null;
}

export interface VideoDetail {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  tags: string[];
  createdAt: string;
  owner: VideoOwner;
}

async function fetchVideo(id: string): Promise<VideoDetail> {
  const res = await fetch(`/api/videos/${id}`);
  if (!res.ok) throw new Error("Video not found");
  const data = await res.json();
  return data.video;
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => fetchVideo(id),
    enabled: !!id,
  });
}
