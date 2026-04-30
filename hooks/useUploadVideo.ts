import { useMutation } from "@tanstack/react-query";
import {
  fetchSignedParams,
  uploadToCloudinaryWithProgress,
} from "@/lib/cloudinary/upload";

interface UploadInput {
  file: File;
  title: string;
  description?: string;
  tags?: string[];
  onProgress?: (percent: number) => void;
}

interface UploadResult {
  videoId: string;
}

async function uploadVideo({
  file,
  title,
  description,
  tags,
  onProgress,
}: UploadInput): Promise<UploadResult> {
  const sign = await fetchSignedParams("video");
  const cloudinaryRes = await uploadToCloudinaryWithProgress(file, sign, onProgress);

  const thumbnail = cloudinaryRes.eager?.[0]?.secure_url ?? null;

  const createRes = await fetch("/api/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description: description || null,
      tags: tags ?? [],
      cloudinary: {
        publicId: cloudinaryRes.public_id,
        url: cloudinaryRes.secure_url,
        thumbnail,
        duration: cloudinaryRes.duration ?? null,
      },
    }),
  });

  if (!createRes.ok) throw new Error("Failed to save video");
  const { video } = await createRes.json();
  return { videoId: video.id };
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: uploadVideo,
  });
}
