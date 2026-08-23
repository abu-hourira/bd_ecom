// app/auth/login/page.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Mail,
  ArrowRight,
  Leaf,
  Loader2,
  Lock,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useFeatures } from "@/context/FeatureFlagContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { t, locale } = useLanguage();
  const { isFeatureEnabled } = useFeatures();

  const phoneOtpEnabled = isFeatureEnabled("phone_otp_login");
  const [loginMethod, setLoginMethod] = useState<"phone" | "password">("password");

  useEffect(() => {
    if (!phoneOtpEnabled) {
      setLoginMethod("password");
    }
  }, [phoneOtpEnabled]);

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otpCode: otpCode.trim() }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("enmar_customer", JSON.stringify(data.user));

        const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(data.user.role);
        if (isStaff) {
          router.push("/admin");
        } else {
          router.push(callbackUrl || "/account/profile");
        }
      } else {
        setError(data.error || "Invalid OTP code.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("enmar_customer", JSON.stringify(data.user));

        if (data.isStaff) {
          router.push("/admin");
        } else {
          router.push(callbackUrl || "/account/profile");
        }
      } else {
        setError(data.error || "Invalid login credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Login request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex items-center justify-center">
        <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest mx-auto flex items-center justify-center mb-2">
              <Leaf className="w-6 h-6 text-emerald-800" />
            </div>
            <h1 className="text-2xl font-bold font-display text-stone-900">
              {t("auth.loginTitle")}
            </h1>
            <p className="text-xs text-stone-500">
              {callbackUrl.includes("checkout")
                ? t("auth.checkoutLoginNotice")
                : t("auth.loginSubtitle")}
            </p>
          </div>

          {/* Toggle Login Method (Only shown if phone_otp_login is enabled in Feature Toggles) */}
          {phoneOtpEnabled && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("password");
                  setError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  loginMethod === "password"
                    ? "bg-forest text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t("auth.emailPass")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("phone");
                  setError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  loginMethod === "phone"
                    ? "bg-forest text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t("auth.phoneOtp")}</span>
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Method 1: Email / Phone & Password */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  {locale === "bn" ? "ইমেইল অ্যাড্রেস" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="customer@enmar.bd"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  {t("auth.passLabel")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim() || !password}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{t("auth.signInBtn")}</span>
                )}
              </button>
            </form>
          )}

          {/* Method 2: Phone OTP (Only if enabled) */}
          {loginMethod === "phone" && phoneOtpEnabled && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      {t("auth.phoneLabel")}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-forest"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone.trim()}
                    className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{t("auth.sendOtp")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-stone-700">
                        {t("auth.otpLabel")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-forest underline font-semibold cursor-pointer"
                      >
                        {t("auth.changePhone")}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="XXXXXX"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-forest"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpCode.trim()}
                    className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{t("auth.verifySignIn")}</span>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Register Link */}
          <div className="text-center pt-3 border-t border-stone-200 text-xs text-stone-500">
            {t("auth.noAccount")}{" "}
            <Link
              href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-forest hover:underline cursor-pointer"
            >
              {t("auth.registerHere")}
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-forest font-medium">
          Loading login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
