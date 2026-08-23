// components/storefront/FloatingWhatsApp.tsx
"use client";

import { MessageCircle } from "lucide-react";
import { useFeatures } from "@/context/FeatureFlagContext";

export default function FloatingWhatsApp() {
  const { isFeatureEnabled } = useFeatures();
  if (!isFeatureEnabled("whatsapp_floating_button")) return null;
  return (
    <a
      href="https://wa.me/8801614113082?text=Hello%20ENMAR,%20I%20would%20like%20to%20order%20organic%20food."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-floating flex items-center gap-2 group transition-all duration-300 hover:scale-105 active:scale-95"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-semibold pr-1">
        WhatsApp Order
      </span>
    </a>
  );
}
