"use client";

import { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  XIcon,
  VideoCameraIcon,
  CircleNotchIcon,
  CheckIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useUploadVideo } from "@/hooks/useUploadVideo";

type UploadStatus = "idle" | "selected" | "uploading" | "success" | "error";

interface UploadFormProps {
  onUploadComplete?: (videoId: string) => void;
}

export default function UploadForm({ onUploadComplete }: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadMutation = useUploadVideo();

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      setErrorMessage("Please select a video file");
      setStatus("error");
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setErrorMessage("File size must be under 500MB");
      setStatus("error");
      return;
    }

    setFile(selectedFile);
    setStatus("selected");
    setErrorMessage("");
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setStatus("uploading");
    setProgress(0);

    uploadMutation.mutate(
      {
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        onProgress: (percent) => setProgress(percent),
      },
      {
        onSuccess: (result) => {
          setProgress(100);
          setStatus("success");
          onUploadComplete?.(result.videoId);
        },
        onError: () => {
          setStatus("error");
          setErrorMessage("Upload failed. Please try again.");
        },
      }
    );
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setTitle("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setProgress(0);
    setStatus("idle");
    setErrorMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {/* Drop zone / File selected */}
      {status === "idle" || status === "error" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-base ${
            dragOver
              ? "border-amber-500 bg-amber-700"
              : "border-border-default hover:border-text-muted hover:bg-bg-hover"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-base ${
                dragOver ? "bg-amber-500/10" : "bg-bg-hover"
              }`}
            >
              <CloudArrowUpIcon
                size={28}
                weight="bold"
                className={dragOver ? "text-amber-500" : "text-text-muted"}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Drag and drop your video here
              </p>
              <p className="text-xs text-text-muted mt-1">
                Or click to browse &middot; MP4, WebM, MOV &middot; Max 500MB
              </p>
            </div>
          </div>

          {status === "error" && errorMessage && (
            <div className="mt-4 flex items-center justify-center gap-2 text-vermillion-100 text-sm">
              <WarningIcon size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview + progress */}
          <div className="relative rounded-xl overflow-hidden bg-bg-base aspect-video">
            {preview && (
              <video
                src={preview}
                className="w-full h-full object-contain"
                muted
                playsInline
              />
            )}

            {status === "uploading" && (
              <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-3">
                <CircleNotchIcon size={32} className="text-text-primary animate-spin" />
                <div className="w-48">
                  <div className="h-1 bg-text-primary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-primary/80 font-mono text-center mt-2">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                  <CheckIcon size={24} weight="bold" className="text-text-primary" />
                </div>
                <p className="text-sm text-text-primary font-medium">Upload complete</p>
              </div>
            )}

            {/* Remove file */}
            {status === "selected" && (
              <button
                type="button"
                onClick={reset}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-bg-base/60 hover:bg-bg-base/80 text-text-primary transition-base"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* File info */}
          {file && (
            <div className="flex items-center gap-3 px-4 py-3 bg-bg-hover rounded-lg">
              <VideoCameraIcon size={18} className="text-text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary font-medium truncate">{file.name}</p>
                <p className="text-xs text-text-muted font-mono">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
          )}

          {/* Form fields */}
          {status === "selected" && (
            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your video a title"
                  maxLength={100}
                  required
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
                />
                <p className="text-xs text-text-muted text-right">
                  {title.length}/100
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video"
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-bg-surface border border-border-default rounded-lg focus-within:border-amber-500 focus-within:shadow-[0_0_0_1px_var(--amber-500)] transition-base">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-700 text-amber-100 text-xs font-medium rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-amber-500 transition-base"
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                    className="flex-1 min-w-30 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {tags.length}/10 tags &middot; Press Enter or comma to add
                </p>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!title.trim() || uploadMutation.isPending}
                  className="px-6 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Success state */}
          {status === "success" && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={reset}
                className="px-6 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base"
              >
                Upload another
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
