// components/storefront/LanguageToggle.tsx
"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center p-0.5 rounded-full bg-stone-100 border border-stone-200 shadow-xs">
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
          locale === "bn"
            ? "bg-forest text-white shadow-xs"
            : "text-stone-600 hover:text-forest"
        }`}
      >
        বাংলা
      </button>

      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
          locale === "en"
            ? "bg-forest text-white shadow-xs"
            : "text-stone-600 hover:text-forest"
        }`}
      >
        EN
      </button>
    </div>
  );
}
