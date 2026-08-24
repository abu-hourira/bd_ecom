"use client";
// app/about/page.tsx

import Link from "next/link";
import { Leaf, ShieldCheck, Heart, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  return (
    <div className="min-h-screen bg-bg text-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
        </Link>

        <div className="space-y-4 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-4 h-4" />
            <span>{t("about.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink leading-tight">
            {t("about.title")}
          </h1>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-display text-ink text-base">
              {t("about.pillar1Title")}
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              {t("about.pillar1Desc")}
            </p>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-display text-ink text-base">
              {t("about.pillar2Title")}
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              {t("about.pillar2Desc")}
            </p>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-display text-ink text-base">
              {t("about.pillar3Title")}
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              {t("about.pillar3Desc")}
            </p>
          </div>
        </div>

        <div className="bg-forest-deep text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-display">{t("about.ctaTitle")}</h3>
            <p className="text-xs text-white/80">{t("about.ctaDesc")}</p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-amber-400 text-forest-deep font-bold text-xs shadow-premium transition-all shrink-0 flex items-center gap-2"
          >
            <span>{isBn ? "শপ ব্রাউজ করুন" : "Explore Shop"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
