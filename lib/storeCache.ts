// lib/storeCache.ts - Instant Zero-Flicker SWR Cache Helper
import defaultCache from "@/data/site-cache.json";

const CACHE_KEY_SETTINGS = "enmar_site_settings_cache";
const CACHE_KEY_CATEGORIES = "enmar_categories_cache";
const CACHE_KEY_HOME = "enmar_home_data_cache_v2";

export function getCachedSettings() {
  if (typeof window === "undefined") return defaultCache;
  try {
    const saved = localStorage.getItem(CACHE_KEY_SETTINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return defaultCache;
}

export function setCachedSettings(data: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY_SETTINGS, JSON.stringify(data));
  } catch (e) {}
}

export function getCachedCategories() {
  if (typeof window === "undefined") return (defaultCache as any)?.categories || [];
  try {
    const saved = localStorage.getItem(CACHE_KEY_CATEGORIES);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return (defaultCache as any)?.categories || [];
}

export function setCachedCategories(data: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(data));
  } catch (e) {}
}

export function getCachedHomeData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_HOME) || localStorage.getItem(CACHE_KEY_HOME);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Valid for 10 minutes cache
      if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {}
  return null;
}

export function setCachedHomeData(data: any) {
  if (typeof window === "undefined" || !data) return;
  try {
    const payload = JSON.stringify({ timestamp: Date.now(), data });
    sessionStorage.setItem(CACHE_KEY_HOME, payload);
    localStorage.setItem(CACHE_KEY_HOME, payload);
  } catch (e) {}
}
