"use client";
// app/privacy/page.tsx

import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicyPage() {
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

        <div className="space-y-3 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>{t("privacy.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {t("privacy.title")}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {t("privacy.subtitle")}
          </p>
        </div>

        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">{t("privacy.collectTitle")}</h3>
              <p>{t("privacy.collectDesc")}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-ink mb-1">{t("privacy.useTitle")}</h3>
              <p>{t("privacy.useDesc")}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-ink mb-1">{t("privacy.securityTitle")}</h3>
              <p>{t("privacy.securityDesc")}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span>{isBn ? "সর্বশেষ হালনাগাদ: আগস্ট ২০২৬" : "Last Updated: August 2026"}</span>
            <div className="flex items-center gap-4">
              <a href="mailto:support@enmar.bd" className="hover:text-forest font-semibold">support@enmar.bd</a>
              <span>•</span>
              <a href="tel:+8801614113082" className="hover:text-forest font-semibold">+880 1614 113082</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
