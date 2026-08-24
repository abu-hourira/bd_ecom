"use client";
// app/shipping/page.tsx

import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ShippingPolicyPage() {
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
            <Truck className="w-4 h-4" />
            <span>{t("shipping.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {t("shipping.title")}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {t("shipping.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-ink">
              {t("shipping.insideDhakaTitle")}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest shrink-0" />
                <span>{t("shipping.insideDhakaTime")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest shrink-0" />
                <span>{t("shipping.insideDhakaFee")}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span className="font-bold text-forest">{t("shipping.freeDeliveryNudge")}</span>
              </li>
            </ul>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/30 text-forest flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-ink">
              {t("shipping.outsideDhakaTitle")}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest shrink-0" />
                <span>{t("shipping.outsideDhakaTime")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest shrink-0" />
                <span>{t("shipping.outsideDhakaFee")}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span className="font-bold text-forest">{t("shipping.outsideDhakaCod")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-ink mb-1">{t("shipping.packagingTitle")}</h4>
              <p>{t("shipping.packagingDesc")}</p>
            </div>
            <div>
              <h4 className="font-bold text-ink mb-1">{t("shipping.trackingTitle")}</h4>
              <p>{t("shipping.trackingDesc")}</p>
            </div>
            <div>
              <h4 className="font-bold text-ink mb-1">{t("shipping.inspectionTitle")}</h4>
              <p>{t("shipping.inspectionDesc")}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-forest" />
              <span className="font-bold text-ink">{isBn ? "সহায়তা হেল্পলাইন: +৮৮০ ১৬১৪ ১১৩০৮২" : "Support: +880 1614 113082"}</span>
            </div>
            <Link
              href="/track"
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium transition-all"
            >
              {isBn ? "অর্ডার ট্র্যাক করুন →" : "Track Your Order →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
