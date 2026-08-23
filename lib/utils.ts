// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and merge Tailwind class names cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Bangladeshi Taka (৳)
 */
export function formatTaka(amount: number | string | null | undefined): string {
  const num = Number(amount || 0);
  return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Generate unique human-readable tracking ID for order tracking
 */
export function generateTrackingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ENM-${token}`;
}

/**
 * Generate human-readable Order Number
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

/**
 * Generate SEO-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Bulletproof helper to format image URLs from uploads or external CDNs
 */
export function getSafeImageUrl(
  url: any,
  fallback = "/assets/products/placeholder.jpg"
): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Handle Windows paths or missing leading slash
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  if (trimmed.startsWith("\\uploads\\")) return trimmed.replace(/\\/g, "/");
  return trimmed;
}

/**
 * Extract image list safely from any product schema field (handles array, JSON string, or single URL)
 */
export function getProductImages(
  rawImages: any,
  fallback = "/assets/products/placeholder.jpg"
): string[] {
  if (!rawImages) return [fallback];

  if (Array.isArray(rawImages)) {
    const list = rawImages
      .filter((img) => typeof img === "string" && img.trim().length > 0)
      .map((img) => getSafeImageUrl(img, fallback));
    return list.length > 0 ? list : [fallback];
  }

  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const list = parsed
            .filter((img) => typeof img === "string" && img.trim().length > 0)
            .map((img) => getSafeImageUrl(img, fallback));
          return list.length > 0 ? list : [fallback];
        }
      } catch (e) {}
    }
    return [getSafeImageUrl(trimmed, fallback)];
  }

  return [fallback];
}
