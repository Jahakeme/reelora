"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
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
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push(callbackUrl);
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
    signIn("google", { callbackUrl });
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-text-inverse text-sm font-bold tracking-tight">R</span>
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
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm font-medium text-text-primary hover:bg-bg-hover active:scale-[0.98] transition-base"
      >
        <GoogleLogoIcon size={18} weight="bold" />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border-default" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-border-default" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">Email</label>
          <div className="relative">
            <EnvelopeIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-primary">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-amber-100 hover:text-amber-500 transition-base"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-base"
            >
              {showPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-vermillion-700 rounded-lg text-vermillion-100 text-sm">
            <WarningIcon size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && <CircleNotchIcon size={16} className="animate-spin" />}
          Sign in
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-text-secondary mt-6">
        New to Reelora?{" "}
        <Link href="/signup" className="font-medium text-amber-100 hover:text-amber-500 transition-base">
          Create an account
        </Link>
      </p>
    </div>
  );
}
