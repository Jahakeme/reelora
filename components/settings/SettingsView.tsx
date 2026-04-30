"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  UserCircleIcon,
  CameraIcon,
  CircleNotchIcon,
  SignOutIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  fetchSignedParams,
  uploadToCloudinaryWithProgress,
} from "@/lib/cloudinary/upload";

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

type Phase = "idle" | "uploading" | "saving";

export default function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const isBusy = phase !== "idle";
  const isDirty = name.trim() !== user.name || stagedFile !== null;
  const avatarSrc = previewUrl ?? user.image ?? null;
  const saveLabel =
    phase === "uploading"
      ? `Uploading ${progress}%`
      : phase === "saving"
        ? "Saving..."
        : "Save changes";

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Avatar must be a JPEG, PNG, or WebP image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be under 4MB");
      e.target.value = "";
      return;
    }

    setStagedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty || isBusy) return;
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    let stage: Phase = "idle";
    try {
      let imageUrl: string | undefined;

      if (stagedFile) {
        stage = "uploading";
        setPhase("uploading");
        setProgress(0);
        const sign = await fetchSignedParams("avatar");
        const result = await uploadToCloudinaryWithProgress(
          stagedFile,
          sign,
          setProgress,
        );
        imageUrl = result.eager?.[0]?.secure_url ?? result.secure_url;
      }

      stage = "saving";
      setPhase("saving");

      const body: { name?: string; image?: string } = {};
      if (name.trim() !== user.name) body.name = name.trim();
      if (imageUrl) body.image = imageUrl;

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Failed to update profile");
      }

      if (imageUrl) {
        await update({ image: imageUrl });
      }

      toast.success("Profile updated");
      setStagedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(stage === "uploading" ? `Upload failed: ${message}` : message);
    } finally {
      setPhase("idle");
      setProgress(0);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Failed to update password");
      }
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-8">
        Settings
      </h1>

      {/* Profile section */}
      <section className="pb-8 border-b border-border-default">
        <h2 className="text-sm font-semibold text-text-primary mb-5">Profile</h2>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="Avatar"
                  width={80}
                  height={80}
                  unoptimized={!!previewUrl}
                  className="w-20 h-20 rounded-full object-cover border border-border-default"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
                  <UserCircleIcon size={32} weight="fill" className="text-text-muted" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                aria-label="Change profile photo"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-bg-base/0 group-hover:bg-bg-base/40 transition-base disabled:cursor-not-allowed"
              >
                <CameraIcon
                  size={20}
                  className="text-text-primary opacity-0 group-hover:opacity-100 transition-base"
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isBusy}
                className="hidden"
              />
              {phase === "uploading" ? (
                <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-bg-hover overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-[width] duration-150 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Profile photo</p>
              <p className="text-xs text-text-muted mt-0.5">JPEG, PNG, or WebP. Max 4MB.</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base disabled:opacity-60"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full px-4 py-2.5 bg-bg-hover border border-border-default rounded-lg text-sm text-text-muted cursor-not-allowed"
            />
            <p className="text-xs text-text-muted">Email cannot be changed</p>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={!isDirty || isBusy}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isBusy ? <CircleNotchIcon size={14} className="animate-spin" /> : null}
            {saveLabel}
          </button>
        </form>
      </section>

      {/* Password section */}
      <section className="py-8 border-b border-border-default">
        <h2 className="text-sm font-semibold text-text-primary mb-5">Password</h2>

        <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2.5 bg-bg-surface border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-vermillion-500"
                  : "border-border-default"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={
              savingPassword ||
              !currentPassword ||
              !newPassword ||
              newPassword !== confirmPassword
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingPassword && <CircleNotchIcon size={14} className="animate-spin" />}
            Update password
          </button>
        </form>
      </section>

      {/* Account */}
      <section className="py-8">
        <h2 className="text-sm font-semibold text-text-primary mb-5">Account</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border-default rounded-xl">
          <div>
            <p className="text-sm font-medium text-text-primary">Sign out</p>
            <p className="text-xs text-text-muted mt-0.5">
              Sign out of your Reelora account on this device
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border-default rounded-md text-sm font-medium text-text-secondary hover:bg-bg-hover active:scale-[0.98] transition-base"
          >
            <SignOutIcon size={16} />
            Sign out
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-vermillion-500/20 rounded-xl mt-3 bg-vermillion-700/30">
          <div>
            <p className="text-sm font-medium text-vermillion-100">Delete account</p>
            <p className="text-xs text-text-muted mt-0.5">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-vermillion-500 text-vermillion-100 rounded-md text-sm font-medium hover:bg-vermillion-500/90 active:scale-[0.98] transition-base">
            <TrashIcon size={16} />
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
