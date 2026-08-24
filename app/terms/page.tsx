"use client";
// app/terms/page.tsx

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
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
            <FileText className="w-4 h-4" />
            <span>{t("terms.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {t("terms.title")}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {t("terms.subtitle")}
          </p>
        </div>

        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">{t("terms.pricingTitle")}</h3>
              <p>{t("terms.pricingDesc")}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-ink mb-1">{t("terms.cancelTitle")}</h3>
              <p>{t("terms.cancelDesc")}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-ink mb-1">{t("terms.returnsTitle")}</h3>
              <p>{t("terms.returnsDesc")}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span>{isBn ? "ENMAR Organic Food - ট্রেড লাইসেন্স ও বিএসটিআই মানসম্পন্ন" : "ENMAR Organic Food - Trade Licensed & BSTI Certified"}</span>
            <Link href="/shipping" className="text-forest font-bold hover:underline">
              {isBn ? "শিপিং পলিসি দেখুন →" : "View Shipping Policy →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
