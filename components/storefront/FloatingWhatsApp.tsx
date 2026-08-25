"use client";
// components/storefront/FloatingWhatsApp.tsx - Floating WhatsApp support positioned above mobile bottom nav

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getCachedSettings } from "@/lib/storeCache";

export default function FloatingWhatsApp() {
  const [phone, setPhone] = useState<string>(() => {
    const cached = getCachedSettings();
    return cached.whatsappNumber || cached.contactPhone || "";
  });

  useEffect(() => {
    fetch("/api/storefront/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const num = data.settings.whatsappNumber || data.settings.contactPhone || "";
          setPhone(num);
        }
      })
      .catch(() => {});
  }, []);

  if (!phone) return null;

  const cleanNumber = phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hello! I want to know about your organic products.")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 p-3 sm:p-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold font-display px-0 group-hover:px-2">
        WhatsApp
      </span>
    </a>
  );
}
