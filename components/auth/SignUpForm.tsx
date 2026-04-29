"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  UserIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  GoogleLogoIcon,
  CircleNotchIcon,
  WarningIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

export default function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passwordStrong =
    passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordStrong) {
      setError("Password does not meet requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/signin");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/" });
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
          Create your account
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          Join Reelora and start sharing videos
        </p>
      </div>

      {/* Google Sign Up */}
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
        {/* Full name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">Full name</label>
          <div className="relative">
            <UserIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base"
            />
          </div>
        </div>

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
          <label className="block text-sm font-medium text-text-primary">Password</label>
          <div className="relative">
            <LockIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {[
                { key: "length" as const, label: "At least 8 characters" },
                { key: "uppercase" as const, label: "One uppercase letter" },
                { key: "number" as const, label: "One number" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <CheckCircleIcon
                    size={14}
                    weight={passwordChecks[key] ? "fill" : "regular"}
                    className={
                      passwordChecks[key] ? "text-amber-100" : "text-text-muted"
                    }
                  />
                  <span
                    className={`text-xs ${
                      passwordChecks[key] ? "text-amber-100" : "text-text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Confirm password
          </label>
          <div className="relative">
            <LockIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className={`w-full pl-10 pr-4 py-2.5 bg-bg-surface border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_1px_var(--amber-500)] transition-base ${
                confirmPassword && confirmPassword !== password
                  ? "border-vermillion-500"
                  : "border-border-default"
              }`}
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-vermillion-100">Passwords do not match</p>
          )}
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
          disabled={loading || !fullName.trim() || !email.trim() || !passwordStrong || password !== confirmPassword}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-text-inverse text-sm font-medium rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && <CircleNotchIcon size={16} className="animate-spin" />}
          Create account
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-amber-100 hover:text-amber-500 transition-base">
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-text-muted mt-4 leading-relaxed max-w-70 mx-auto">
        By creating an account, you agree to the Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
