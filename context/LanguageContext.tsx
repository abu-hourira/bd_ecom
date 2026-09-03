"use client";
// context/LanguageContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations as defaultTranslations } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  lang: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  refreshTranslations: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");
  const [activeTranslations, setActiveTranslations] = useState(defaultTranslations);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchDynamicTranslations = async () => {
    try {
      const res = await fetch("/api/storefront/i18n", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.translations) {
        setActiveTranslations(data.translations);
      }
    } catch (e) {
      console.warn("[LanguageContext] Dynamic i18n fallback to local seed:", e);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("enmar_lang") as Locale;
      if (saved && (saved === "bn" || saved === "en")) {
        setLocaleState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      } else {
        if (typeof document !== "undefined") {
          document.documentElement.lang = "bn";
        }
      }
    } catch (e) {
      console.error("[LanguageContext] Load error:", e);
    } finally {
      setIsLoaded(true);
      fetchDynamicTranslations();
    }

    const handleFocus = () => fetchDynamicTranslations();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("enmar_lang", newLocale);
      document.documentElement.lang = newLocale;
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "bn" ? "en" : "bn");
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text =
      activeTranslations[locale]?.[key] ||
      activeTranslations["en"]?.[key] ||
      defaultTranslations[locale]?.[key] ||
      defaultTranslations["en"]?.[key] ||
      key;

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        lang: locale,
        setLocale,
        toggleLocale,
        t,
        refreshTranslations: fetchDynamicTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
