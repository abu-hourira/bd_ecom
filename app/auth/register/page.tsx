"use client";
// app/auth/register/page.tsx

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Phone,
  RotateCcw,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import { useLanguage } from "@/context/LanguageContext";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { t, locale } = useLanguage();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Submit Registration Form
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(locale === "bn" ? "সকল আবশ্যকীয় তথ্য পূরণ করুন।" : "Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (data.success && data.requireVerification) {
        setStep("verify");
        setSuccessMsg(
          locale === "bn"
            ? `আপনার ${data.email} ইমেইলে ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`
            : `A 6-digit verification code has been sent to ${data.email}.`
        );
      } else {
        setError(data.error || (locale === "bn" ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে।" : "Failed to create account."));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 6-Digit Email Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: verificationCode.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("enmar_customer", JSON.stringify(data.user));
        router.push(callbackUrl || "/account/profile");
      } else {
        setError(data.error || (locale === "bn" ? "ভুল ভেরিফিকেশন কোড।" : "Invalid verification code."));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend Code
  const handleResendCode = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          locale === "bn"
            ? "আপনার ইমেইলে নতুন কোড পাঠানো হয়েছে।"
            : "A new verification code has been sent to your email."
        );
      } else {
        setError(data.error || "Failed to resend code.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-md mx-auto px-4 py-14 flex-1 w-full flex flex-col justify-center">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest mx-auto flex items-center justify-center font-display font-bold text-xl text-emerald-800">
              {step === "verify" ? <ShieldCheck className="w-6 h-6" /> : "E"}
            </div>
            <h1 className="text-2xl font-bold font-display text-stone-900">
              {step === "verify"
                ? locale === "bn"
                  ? "ইমেইল ভেরিফিকেশন"
                  : "Verify Email Address"
                : t("auth.registerTitle")}
            </h1>
            <p className="text-xs text-stone-500">
              {step === "verify"
                ? locale === "bn"
                  ? "আপনার অ্যাকাউন্ট সক্রিয় করতে ইমেইলে পাঠানো কোডটি লিখুন"
                  : "Enter the 6-digit code sent to your email to activate your account"
                : t("hero.badge")}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === "form" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  {t("auth.fullName")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakil Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  {locale === "bn" ? "ইমেইল অ্যাড্রেস" : "Email Address"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="customer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  {locale === "bn" ? "মোবাইল নম্বর (ঐচ্ছিক)" : "Phone Number (Optional)"}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  {t("auth.passLabel")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{locale === "bn" ? "অ্যাকাউন্ট তৈরি ও কোড পাঠান" : "Continue to Verification"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Email Verification Code Form */}
          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    {locale === "bn" ? "৬ ডিজিটের ভেরিফিকেশন কোড" : "6-Digit Verification Code"}
                  </label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-[11px] text-forest underline font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resending ? "Sending..." : locale === "bn" ? "পুনরায় কোড পাঠান" : "Resend Code"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="XXXXXX"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-forest"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !verificationCode.trim()}
                className="w-full py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{locale === "bn" ? "ভেরিফাই ও প্রবেশ করুন" : "Verify & Complete Signup"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError(null);
                }}
                className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
              >
                {locale === "bn" ? "ইমেইল সংশোধন করুন" : "Change Email Address"}
              </button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-stone-200 text-xs text-stone-500">
            {locale === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already have an account? "}
            <Link
              href={`/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-forest hover:underline cursor-pointer"
            >
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-forest font-medium">
          Loading registration...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
