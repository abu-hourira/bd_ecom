"use client";
// context/FeatureFlagContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";

interface FeatureFlagContextType {
  features: Record<string, boolean>;
  isFeatureEnabled: (key: string) => boolean;
  refreshFeatures: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<Record<string, boolean>>({
    wishlist: true,
    reviews: true,
    customer_ai_widget: true,
    promo_codes: true,
    wellness_tools: true,
    new_product_notifications: true,
    payment_cod: true,
    payment_bkash: true,
    payment_card: true,
    homepage_testimonials: true,
    homepage_combos_banner: true,
    whatsapp_floating_button: true,
    cookie_consent_banner: true,
    search_autocomplete: true,
  });

  const fetchFeatures = async () => {
    try {
      const res = await fetch("/api/storefront/features");
      const data = await res.json();
      if (data.success && data.features) {
        setFeatures(data.features);
        try {
          localStorage.setItem("enmar_features_cache", JSON.stringify(data.features));
        } catch (err) {}
      }
    } catch (e) {
      console.warn("[FeatureFlagContext] Fallback to default flags:", e);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem("enmar_features_cache");
      if (cached) {
        setFeatures(JSON.parse(cached));
      }
    } catch (e) {}
    fetchFeatures();
  }, []);

  const isFeatureEnabled = (key: string): boolean => {
    return features[key] !== false; // Default true if not explicitly false
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        features,
        isFeatureEnabled,
        refreshFeatures: fetchFeatures,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatures must be used within a FeatureFlagProvider");
  }
  return context;
}
