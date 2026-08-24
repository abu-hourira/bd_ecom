"use client";
// components/storefront/FloatingWhatsApp.tsx

import { MessageCircle } from "lucide-react";
import { useFeatures } from "@/context/FeatureFlagContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FloatingWhatsApp() {
  const { isFeatureEnabled } = useFeatures();
  const { locale } = useLanguage();

  if (!isFeatureEnabled("whatsapp_floating_button")) return null;

  return (
    <a
      href="https://wa.me/8801614113082?text=Hello%20ENMAR,%20I%20would%20like%20to%20order%20organic%20food."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-floating flex items-center gap-2 group transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/80 cursor-pointer"
      title={locale === "bn" ? "হোয়াটসঅ্যাপে অর্ডার বা তথ্য জানুন" : "Chat on WhatsApp (+8801614113082)"}
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="w-5 h-5 text-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-bold pr-1">
        {locale === "bn" ? "হোয়াটসঅ্যাপ সহায়তা" : "WhatsApp Chat"}
      </span>
    </a>
  );
}
