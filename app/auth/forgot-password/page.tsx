"use client";
// app/auth/forgot-password/page.tsx - Forgot Password via Gmail OTP & Reset Link

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Leaf,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const { locale } = useLanguage();
  const router = useRouter();

  // Step 1: Email Input | Step 2: OTP + New Password
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend Timer
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Send OTP / Reset Link
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          locale === "bn"
            ? `আপনার জিমেইলে (${email}) একটি ৬-সংখ্যার ভেরিফিকেশন কোড ও রিসেট লিঙ্ক পাঠানো হয়েছে।`
            : `A 6-digit verification code and reset link have been sent to your Gmail (${email}).`
        );
        setStep(2);
        startCooldown();
      } else {
        setError(data.error || "Failed to send reset code.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit OTP + New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword || !confirmPassword) return;

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
          email: email.trim(),
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          locale === "bn"
            ? "আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! লগইন পেজে রিডাইরেক্ট করা হচ্ছে..."
            : "Your password has been reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex items-center justify-center">
        <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest mx-auto flex items-center justify-center mb-1">
              <KeyRound className="w-6 h-6 text-emerald-800" />
            </div>
            <h1 className="text-2xl font-bold font-display text-stone-900">
              {locale === "bn" ? "পাসওয়ার্ড রিসেট করুন" : "Forgot Your Password?"}
            </h1>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {step === 1
                ? locale === "bn"
                  ? "আপনার রেজিস্টার্ড জিমেইল অ্যাড্রেস লিখুন। আমরা আপনাকে পাসওয়ার্ড রিসেট কোড পাঠাব।"
                  : "Enter your registered Gmail address to receive a 6-digit verification code and reset link."
                : locale === "bn"
                ? "আপনার জিমেইলে পাঠানো ৬-সংখ্যার কোড এবং নতুন পাসওয়ার্ড লিখুন।"
                : "Enter the 6-digit code sent to your Gmail along with your new password."}
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

          {/* STEP 1: Enter Gmail Address */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  {locale === "bn" ? "জিমেইল / ইমেইল অ্যাড্রেস" : "Gmail / Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>{locale === "bn" ? "রিসেট কোড পাঠান" : "Send Reset Code & Link"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP + New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-stone-700">
                    {locale === "bn" ? "৬-সংখ্যার ভেরিফিকেশন কোড" : "6-Digit Verification Code"}
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-[11px] font-semibold text-forest hover:underline disabled:text-stone-400 cursor-pointer"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : locale === "bn"
                      ? "কোড আবার পাঠান"
                      : "Resend Code"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center font-mono text-xl font-bold tracking-widest text-stone-900 focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                disabled={loading || !otpCode.trim() || !newPassword || !confirmPassword}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{locale === "bn" ? "পাসওয়ার্ড আপডেট করুন" : "Set New Password"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-center text-xs font-semibold text-stone-500 hover:text-stone-700 cursor-pointer"
              >
                &larr; {locale === "bn" ? "ইমেইল পরিবর্তন করুন" : "Change Email Address"}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
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
      </main>

      <Footer />
    </div>
  );
}
