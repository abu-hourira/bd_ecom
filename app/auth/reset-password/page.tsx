"use client";
// app/auth/reset-password/page.tsx - Direct 1-Click Link Password Reset Page

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { useLanguage } from "@/context/LanguageContext";

function ResetPasswordForm() {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token && !email) {
      setError(
        locale === "bn"
          ? "অবৈধ বা মেয়াদোত্তীর্ণ রিসেট লিঙ্ক।"
          : "Invalid or expired reset link."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        locale === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        locale === "bn"
          ? "উভয় পাসওয়ার্ড হুবহু একই হতে হবে।"
          : "Passwords do not match."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          locale === "bn"
            ? "আপনার পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে..."
            : "Your password has been reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest mx-auto flex items-center justify-center mb-1">
          <KeyRound className="w-6 h-6 text-emerald-800" />
        </div>
        <h1 className="text-2xl font-bold font-display text-stone-900">
          {locale === "bn" ? "নতুন পাসওয়ার্ড সেট করুন" : "Set New Password"}
        </h1>
        <p className="text-xs text-stone-500 max-w-xs mx-auto">
          {email ? (
            <span>
              {locale === "bn" ? "অ্যাকাউন্ট: " : "Account: "}
              <strong className="text-stone-700">{email}</strong>
            </span>
          ) : (
            locale === "bn"
              ? "আপনার অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড লিখুন।"
              : "Enter a strong new password for your account."
          )}
        </p>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-stone-700">
            {locale === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-forest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-stone-700">
            {locale === "bn" ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{locale === "bn" ? "পাসওয়ার্ড আপডেট করুন" : "Update Password"}</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-2 border-t border-stone-100 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{locale === "bn" ? "লগইন পেজে ফিরে যান" : "Back to Sign In"}</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />
      <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex items-center justify-center">
        <Suspense fallback={<div className="p-8 text-center text-sm text-stone-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
