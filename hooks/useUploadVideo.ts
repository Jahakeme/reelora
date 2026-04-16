import { useMutation } from "@tanstack/react-query";

interface SignResponse {
  uploadUrl: string;
  signedParams: {
    api_key: string;
    timestamp: number;
    folder: string;
    eager: string;
    signature: string;
  };
}

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  eager?: Array<{ secure_url: string }>;
  duration?: number;
}

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
  // 1. Get signed params from our API
  const signRes = await fetch("/api/upload/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Failed to get upload signature");
  const { uploadUrl, signedParams }: SignResponse = await signRes.json();

  // 2. Upload to Cloudinary via XHR (for progress tracking)
  const cloudinaryRes = await new Promise<CloudinaryResponse>(
    (resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signedParams.api_key);
      formData.append("timestamp", String(signedParams.timestamp));
      formData.append("folder", signedParams.folder);
      formData.append("eager", signedParams.eager);
      formData.append("signature", signedParams.signature);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress?.(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Cloudinary upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    }
  );

  // 3. Save video record in our database
  const thumbnail =
    cloudinaryRes.eager?.[0]?.secure_url ?? null;

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
