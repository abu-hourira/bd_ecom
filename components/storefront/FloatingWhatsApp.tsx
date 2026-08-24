"use client";
// components/storefront/FloatingWhatsApp.tsx

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useFeatures } from "@/context/FeatureFlagContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FloatingWhatsApp() {
  const { isFeatureEnabled } = useFeatures();
  const { locale } = useLanguage();
  const [waNumber, setWaNumber] = useState("8801614113082");
  const [waMessage, setWaMessage] = useState("Hello ENMAR, I would like to order organic food.");

  useEffect(() => {
    fetch("/api/storefront/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.whatsappNumber) {
            const cleanNum = data.settings.whatsappNumber.replace(/[^0-9]/g, "");
            if (cleanNum) setWaNumber(cleanNum);
          }
          if (data.settings.whatsappDefaultMessage) {
            setWaMessage(data.settings.whatsappDefaultMessage);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!isFeatureEnabled("whatsapp_floating_button")) return null;

  const encodedMsg = encodeURIComponent(waMessage);
  const waUrl = "https://wa.me/" + waNumber + "?text=" + encodedMsg;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 p-3 sm:p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center gap-2 group transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/90 cursor-pointer"
      title={locale === "bn" ? "হোয়াটসঅ্যাপে যোগাযোগ করুন (" + waNumber + ")" : "Chat on WhatsApp (" + waNumber + ")"}
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="w-5 h-5 text-white" />
      <span className="hidden sm:inline max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-bold pr-1">
        {locale === "bn" ? "হোয়াটসঅ্যাপ সহায়তা" : "WhatsApp Chat"}
      </span>
    </a>
  );
}
