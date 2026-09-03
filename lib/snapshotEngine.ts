// lib/snapshotEngine.ts - High-Performance JSON Snapshot & Storefront Cache Engine

import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

const SNAPSHOT_DIR = path.join(process.cwd(), "data", "snapshots");

function serializePrisma(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    })
  );
}

function sanitizeProductCards(list: any[]): any[] {
  return list.map((p) => {
    let imgs: any[] = [];
    if (Array.isArray(p.images)) {
      imgs = p.images.slice(0, 2);
    } else if (typeof p.images === "string") {
      try {
        const parsed = JSON.parse(p.images);
        imgs = Array.isArray(parsed) ? parsed.slice(0, 2) : [p.images];
      } catch (e) {
        imgs = [p.images];
      }
    }
    return {
      ...p,
      images: imgs,
    };
  });
}

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  categoryId: true,
  subcategory: true,
  price: true,
  discountPrice: true,
  stockQuantity: true,
  unitQuantity: true,
  unit: true,
  images: true,
  description: true,
  shortDescription: true,
  organicCertified: true,
  isCombo: true,
  comboProductIds: true,
  savingsPercentage: true,
  badge: true,
  featured: true,
  weightInGrams: true,
  deliveryDiscountMinQty: true,
  deliveryDiscountAmount: true,
  deliveryDiscountType: true,
  deliveryDiscountTiers: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true, icon: true },
  },
} as const;

export interface StorefrontSnapshots {
  home: any;
  products: any[];
  categories: any[];
  settings: Record<string, string>;
  theme: any;
  features: Record<string, boolean>;
  updatedAt: string;
}

export async function generateStorefrontSnapshots(): Promise<StorefrontSnapshots | null> {
  try {
    const [
      categories,
      allProducts,
      siteSettings,
      theme,
      banners,
      featureFlags,
    ] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          image: true,
          displayOrder: true,
          _count: { select: { products: true } },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: PRODUCT_SELECT,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.siteSetting.findMany({
        where: { isSecret: false },
        select: { key: true, value: true },
      }),
      prisma.themeSetting.findFirst(),
      prisma.promotionBanner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.featureFlag.findMany({
        select: { key: true, isEnabled: true },
      }),
    ]);

    const settingsMap: Record<string, string> = {
      brandName: "ENMAR",
      brandTagline: "100% Pure Organic & Healthy Food",
      contactPhone: "+8801700000000",
      contactEmail: "info@enmar.com.bd",
      contactAddress: "Dhaka, Bangladesh",
      whatsappNumber: "+8801700000000",
      whatsappDefaultMessage: "Hello ENMAR, I want to inquire about your products.",
      siteLogo: "/assets/logo/logo.png",
      siteFavicon: "/favicon.ico",
      freeShippingThreshold: "1500",
      shippingFlat: "100",
      delivery_base_fee: "100",
      delivery_base_weight_kg: "1.0",
      delivery_per_extra_kg: "20",
      delivery_free_shipping_threshold: "1500",
    };

    siteSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const featuresMap: Record<string, boolean> = {
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
    featureFlags.forEach((f) => {
      featuresMap[f.key] = f.isEnabled;
    });

    const serializedProducts = serializePrisma(allProducts);
    const cardOptimizedProducts = sanitizeProductCards(serializedProducts);
    const featuredProducts = cardOptimizedProducts.slice(0, 36);
    const comboDeals = cardOptimizedProducts.filter((p) => p.isCombo).slice(0, 8);

    const homePayload = {
      categories: serializePrisma(categories),
      featuredProducts,
      comboDeals,
      settings: settingsMap,
      theme: serializePrisma(theme),
      banners: serializePrisma(banners),
    };

    const snapshotData: StorefrontSnapshots = {
      home: homePayload,
      products: serializedProducts,
      categories: serializePrisma(categories),
      settings: settingsMap,
      theme: serializePrisma(theme),
      features: featuresMap,
      updatedAt: new Date().toISOString(),
    };

    // 1. Sync directly to RAM memory cache (0.1ms access)
    serverCache.set("snapshot_home", homePayload, 3600, ["home", "products", "settings", "categories"]);
    serverCache.set("snapshot_products", serializedProducts, 3600, ["products"]);
    serverCache.set("snapshot_categories", categories, 3600, ["categories"]);
    serverCache.set("snapshot_settings", { settings: settingsMap, theme }, 3600, ["settings", "theme"]);
    serverCache.set("snapshot_bootstrap", { settings: settingsMap, categories, features: featuresMap }, 3600, ["settings", "categories", "features"]);

    // 2. Persist to disk JSON snapshots for resilient zero-latency reads & cold-boot speed
    try {
      await mkdir(SNAPSHOT_DIR, { recursive: true });
      await Promise.all([
        writeFile(path.join(SNAPSHOT_DIR, "home.json"), JSON.stringify(homePayload)),
        writeFile(path.join(SNAPSHOT_DIR, "products.json"), JSON.stringify(serializedProducts)),
        writeFile(path.join(SNAPSHOT_DIR, "categories.json"), JSON.stringify(categories)),
        writeFile(path.join(SNAPSHOT_DIR, "settings.json"), JSON.stringify({ settings: settingsMap, theme })),
        writeFile(path.join(SNAPSHOT_DIR, "bootstrap.json"), JSON.stringify({ settings: settingsMap, categories, features: featuresMap })),
      ]);
    } catch (diskErr) {
      // Serverless environments without disk write permission will seamlessly use serverCache RAM
    }

    return snapshotData;
  } catch (error) {
    console.error("[generateStorefrontSnapshots Error]:", error);
    return null;
  }
}

export async function getStorefrontSnapshot<T = any>(
  key: "home" | "products" | "categories" | "settings" | "bootstrap"
): Promise<T | null> {
  // 1. Fast Memory RAM check (0.1ms)
  const cached = serverCache.get<T>(`snapshot_${key}`);
  if (cached) return cached;

  // 2. Fast Local Disk JSON check (0.5ms)
  try {
    const filePath = path.join(SNAPSHOT_DIR, `${key}.json`);
    const fileContent = await readFile(filePath, "utf-8");
    if (fileContent) {
      const parsed = JSON.parse(fileContent);
      serverCache.set(`snapshot_${key}`, parsed, 3600, [key]);
      return parsed as T;
    }
  } catch (e) {
    // Disk file might not exist yet, fallback to fresh generation
  }

  // 3. Generate on-demand from database
  const snapshots = await generateStorefrontSnapshots();
  if (!snapshots) return null;

  if (key === "home") return snapshots.home as T;
  if (key === "products") return snapshots.products as T;
  if (key === "categories") return snapshots.categories as T;
  if (key === "settings") return { settings: snapshots.settings, theme: snapshots.theme } as T;
  if (key === "bootstrap") return { settings: snapshots.settings, categories: snapshots.categories, features: snapshots.features } as T;

  return null;
}

/**
 * Call this function whenever an admin modifies products, categories, settings, banners, or theme.
 * Non-blocking async background rebuild.
 */
export function triggerSnapshotRebuild(): void {
  generateStorefrontSnapshots().catch((err) => {
    console.warn("[Snapshot Rebuild Warning]:", err);
  });
}
