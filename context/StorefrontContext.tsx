"use client";
// context/StorefrontContext.tsx - High-Performance Unified Storefront Metadata Provider

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCachedSettings, setCachedSettings, getCachedCategories, setCachedCategories } from "@/lib/storeCache";

interface StorefrontContextType {
  settings: Record<string, string>;
  categories: any[];
  features: Record<string, boolean>;
  isFeatureEnabled: (key: string) => boolean;
  refreshBootstrap: () => Promise<void>;
}

const DEFAULT_FEATURES: Record<string, boolean> = {
  require_login_checkout: true,
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
};

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

// In-memory promise deduplication so only 1 network request ever runs at a time
let bootstrapPromise: Promise<any> | null = null;

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>(() => getCachedSettings());
  const [categories, setCategories] = useState<any[]>(() => getCachedCategories());
  const [features, setFeatures] = useState<Record<string, boolean>>(DEFAULT_FEATURES);

  const fetchBootstrap = useCallback(async () => {
    if (!bootstrapPromise) {
      bootstrapPromise = fetch("/api/storefront/bootstrap")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.settings) {
              setSettings(data.settings);
              setCachedSettings(data.settings);
            }
            if (data.categories) {
              setCategories(data.categories);
              setCachedCategories(data.categories);
            }
            if (data.features) {
              setFeatures((prev) => ({ ...prev, ...data.features }));
            }
          }
          return data;
        })
        .catch((e) => {
          console.warn("[StorefrontProvider] Bootstrap error:", e);
        })
        .finally(() => {
          bootstrapPromise = null;
        });
    }
    return bootstrapPromise;
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  const isFeatureEnabled = useCallback(
    (key: string): boolean => {
      return features[key] !== false;
    },
    [features]
  );

  return (
    <StorefrontContext.Provider
      value={{
        settings,
        categories,
        features,
        isFeatureEnabled,
        refreshBootstrap: fetchBootstrap,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront(): StorefrontContextType {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within a StorefrontProvider");
  }
  return context;
}
