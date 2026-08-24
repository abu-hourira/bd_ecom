"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bike, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    fetch("/api/delivery/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/delivery/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/delivery/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      router.replace("/delivery/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14421a] flex flex-col justify-between p-4 sm:p-6 text-paper antialiased">
      {/* Brand Header */}
      <div className="pt-6 sm:pt-10 flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-paper/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-floating">
          <Bike className="w-9 h-9 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-paper">
            ENMAR Driver Express
          </h1>
          <p className="text-xs text-white/70 mt-0.5">
            Delivery Personnel & Live Order Portal
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm mx-auto my-auto bg-paper text-ink rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="mb-6">
          <h2 className="text-lg font-bold font-display text-forest-deep">
            Rider Sign In
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            Enter your registered mobile phone number and PIN to access your route.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="e.g. 01711000111"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-bg border border-line text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Password / PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-bg border border-line text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-paper font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-forest/30 transition transform active:scale-[0.99] disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Enter Driver Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer info */}
      <div className="pb-4 text-center text-xs text-white/50 space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Encrypted GPS Fleet System</span>
        </div>
        <div>ENMAR Organic Food Express Delivery</div>
      </div>
    </div>
  );
}
