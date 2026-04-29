"use client";

import { useState, useRef } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  UserCircleIcon,
  CameraIcon,
  CircleNotchIcon,
  CheckIcon,
  WarningIcon,
  SignOutIcon,
  TrashIcon,
} from "@phosphor-icons/react";

interface SettingsViewProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

export default function SettingsView({ user }: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image must be under 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          fullName: name.trim(),
        }),
      });

      if (res.ok) {
        setSuccessMessage("Profile updated");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Failed to update profile");
      }
    } catch {
      setErrorMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        setSuccessMessage("Password updated");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Failed to update password");
      }
    } catch {
      setErrorMessage("Something went wrong");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-8">
        Settings
      </h1>

      {/* Success / Error messages */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-700 rounded-lg text-amber-100 text-sm mb-6">
          <CheckIcon size={16} weight="bold" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-vermillion-700 rounded-lg text-vermillion-100 text-sm mb-6">
          <WarningIcon size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile section */}
      <section className="pb-8 border-b border-border-default">
        <h2 className="text-sm font-semibold text-text-primary mb-5">Profile</h2>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  width={80}
                  height={80}
                  unoptimized
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
                className="absolute inset-0 flex items-center justify-center rounded-full bg-bg-base/0 group-hover:bg-bg-base/40 transition-base"
              >
                <CameraIcon 
                  size={20}
                  className="text-text-primary opacity-0 group-hover:opacity-100 transition-base"
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Profile photo</p>
              <p className="text-xs text-text-muted mt-0.5">JPG, PNG, or GIF. Max 5MB.</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2.5 bg-bg-hover border border-border-default rounded-lg text-sm text-text-muted cursor-not-allowed"
            />
            <p className="text-xs text-text-muted">Email cannot be changed</p>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving && <CircleNotchIcon size={14} className="animate-spin" />}
            Save changes
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
            disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingPassword && <CircleNotchIcon size={14} className="animate-spin" />}
            Update password
          </button>
        </form>
      </section>

      {/* Danger zone */}
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
