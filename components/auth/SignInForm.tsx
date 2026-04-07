"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  GoogleLogoIcon,
  CircleNotchIcon,
  WarningIcon,
} from "@phosphor-icons/react";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          password,
          redirect: false,
        }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    window.location.href = "/api/auth/signin/google";
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center">
            <span className="text-surface text-sm font-bold tracking-tight">R</span>
          </div>
        </Link>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          Sign in to your Reelora account
        </p>
      </div>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover active:scale-[0.98] transition-base"
      >
        <GoogleLogoIcon size={18} weight="bold" />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-tertiary">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">Email</label>
          <div className="relative">
            <EnvelopeIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)] transition-base"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-primary">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent-text hover:text-accent transition-base"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)] transition-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-base"
            >
              {showPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-danger-subtle rounded-lg text-danger-text text-sm">
            <WarningIcon size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-text-primary text-surface text-sm font-medium rounded-lg hover:bg-[#333333] active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && <CircleNotchIcon size={16} className="animate-spin" />}
          Sign in
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-text-secondary mt-6">
        New to Reelora?{" "}
        <Link href="/signup" className="font-medium text-accent-text hover:text-accent transition-base">
          Create an account
        </Link>
      </p>
    </div>
  );
}
