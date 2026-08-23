// components/storefront/CookieConsent.tsx
"use client";

import { useEffect, useState } from "react";
import { useFeatures } from "@/context/FeatureFlagContext";
import { Cookie, Check, X } from "lucide-react";

export default function CookieConsent() {
  const { isFeatureEnabled } = useFeatures();
  if (!isFeatureEnabled("cookie_consent_banner")) return null;
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("enmar_cookie_consent");
      if (!consent) {
        setShow(true);
      }
    } catch (e) {}
  }, []);

  const handleAccept = () => {
    localStorage.setItem("enmar_cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("enmar_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-paper p-5 rounded-3xl border border-line shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-forest font-bold text-xs">
          <Cookie className="w-4 h-4 text-accent" />
          <span>Cookie & Privacy Preferences</span>
        </div>

        <p className="text-xs text-ink-soft leading-relaxed">
          We use essential cookies to maintain your shopping cart, secure payments, and optimize your organic food browsing experience.
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleDecline}
            className="px-3.5 py-1.5 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl bg-forest text-white text-xs font-bold shadow-xs hover:bg-forest-deep"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
