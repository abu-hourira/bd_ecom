"use client";
// app/track/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Search, ShieldCheck, ArrowRight } from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function TrackPage() {
  const router = useRouter();
  const [trackingInput, setTrackingInput] = useState("");
  const { t } = useLanguage();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      router.push(`/track/${encodeURIComponent(trackingInput.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 flex-1 w-full space-y-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-forest-soft text-forest mx-auto flex items-center justify-center shadow-card">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {t("track.title")}
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
            {t("track.subtitle")}
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              {t("track.inputLabel")}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-4 top-3.5 text-ink-soft" />
                <input
                  type="text"
                  required
                  placeholder="Enter tracking ID (e.g. ENM-XXXXXXXX)"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg border border-line text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-premium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shrink-0"
              >
                <span>{t("track.button")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 pt-3 border-t border-line text-xs text-ink-soft">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
            <span>Updated in real-time by ENMAR dispatch centers & courier partners.</span>
          </div>
        </div>

        {/* Tracking Stages Highlight */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-paper border border-line">
            <div className="text-xs font-bold text-ink">1. {t("track.stageConfirmed")}</div>
            <div className="text-[10px] text-ink-soft mt-0.5">Order confirmed</div>
          </div>
          <div className="p-4 rounded-2xl bg-paper border border-line">
            <div className="text-xs font-bold text-ink">2. {t("track.stagePacked")}</div>
            <div className="text-[10px] text-ink-soft mt-0.5">Farm fresh packed</div>
          </div>
          <div className="p-4 rounded-2xl bg-paper border border-line">
            <div className="text-xs font-bold text-ink">3. {t("track.stageShipped")}</div>
            <div className="text-[10px] text-ink-soft mt-0.5">Handed to courier</div>
          </div>
          <div className="p-4 rounded-2xl bg-paper border border-line">
            <div className="text-xs font-bold text-ink">4. {t("track.stageDelivered")}</div>
            <div className="text-[10px] text-ink-soft mt-0.5">At your doorstep</div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
