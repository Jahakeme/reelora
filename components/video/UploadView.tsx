"use client";

import { useRouter } from "next/navigation";
import { VideoCameraIcon } from "@phosphor-icons/react";
import UploadForm from "./UploadForm";

export default function UploadView() {
  const router = useRouter();

  function handleUploadComplete(data: { title: string; description: string; tags: string[] }) {
    // After upload is complete, redirect to the home feed
    // In production this would redirect to the newly created video
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center">
          <VideoCameraIcon size={20} weight="bold" className="text-text-secondary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">
            Upload video
          </h1>
          <p className="text-xs text-text-tertiary">
            Share your content with the Reelora community
          </p>
        </div>
      </div>

      <UploadForm onUploadComplete={handleUploadComplete} />
    </div>
  );
}
