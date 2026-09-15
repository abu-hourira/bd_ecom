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

const DEFAULT_CATEGORIES = [
  { name: "Honey & Sweeteners", slug: "honey-sweeteners", icon: "honey", description: "100% Pure Raw Honey from Sundarbans & mustard flowers" },
  { name: "Oils & Ghee", slug: "oils-ghee", icon: "oil", description: "Cold-pressed mustard oil, virgin coconut oil, pure bilona ghee" },
  { name: "Dates & Dry Fruits", slug: "dates-dry-fruits", icon: "dates", description: "Premium Ajwa, Medjool, and organic dry dates" },
  { name: "Organic Spices", slug: "organic-spices", icon: "spice", description: "Freshly ground turmeric, cumin, chili, and whole spices" },
  { name: "Nuts & Seeds", slug: "nuts-seeds", icon: "nuts", description: "Almonds, cashew nuts, chia seeds, and pumpkin seeds" },
  { name: "Tea & Coffee", slug: "tea-coffee", icon: "tea", description: "Organic Sylhet black tea, green tea, artisanal roasted coffee" },
  { name: "Rice, Flour & Pulses", slug: "rice-flour-pulses", icon: "grain", description: "Nazirshail rice, red rice, organic dal, unbleached flour" },
  { name: "Organic Health & Wellness", slug: "organic-health-wellness", icon: "leaf", description: "Certified black seed oil, moringa powder, spirulina" },
  { name: "Combo & Bundle Deals", slug: "combo-bundle-deals", icon: "bundle", description: "Curated pantry packs with exclusive savings" },
  { name: "Pickles & Preserves", slug: "pickles-preserves", icon: "pickle", description: "Traditional homemade mango, olive, and garlic pickles" },
];

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
    let [
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

    // Auto-seed default categories if database is completely empty
    if (categories.length === 0) {
      try {
        for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
          const cat = DEFAULT_CATEGORIES[i];
          await prisma.category.upsert({
            where: { name: cat.name },
            update: { displayOrder: i },
            create: {
              name: cat.name,
              slug: cat.slug,
              icon: cat.icon,
              description: cat.description,
              displayOrder: i,
              isActive: true,
            },
          });
        }
        categories = await prisma.category.findMany({
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
        });
      } catch (catSeedErr) {}
    }

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

    siteSettings.forEach((s: any) => {
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
    featureFlags.forEach((f: any) => {
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
    serverCache.set("snapshot_home", homePayload, 120, ["home", "products", "settings", "categories"]);
    serverCache.set("snapshot_products", serializedProducts, 120, ["products"]);
    serverCache.set("snapshot_categories", categories, 120, ["categories"]);
    serverCache.set("snapshot_settings", { settings: settingsMap, theme }, 120, ["settings", "theme"]);
    serverCache.set("snapshot_bootstrap", { settings: settingsMap, categories, features: featuresMap }, 120, ["settings", "categories", "features"]);

    // 2. Persist to disk JSON snapshots for resilient offline fallback
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

  // 2. Live Database Query (Directly from TiDB Cloud / MySQL)
  try {
    const snapshots = await generateStorefrontSnapshots();
    if (snapshots) {
      if (key === "home") return snapshots.home as T;
      if (key === "products") return snapshots.products as T;
      if (key === "categories") return snapshots.categories as T;
      if (key === "settings") return { settings: snapshots.settings, theme: snapshots.theme } as T;
      if (key === "bootstrap") return { settings: snapshots.settings, categories: snapshots.categories, features: snapshots.features } as T;
    }
  } catch (dbErr) {
    console.warn(`[getStorefrontSnapshot ${key} DB Warning]:`, dbErr);
  }

  // 3. Resilient Local Disk JSON Fallback (if DB is unreachable or offline)
  try {
    const filePath = path.join(SNAPSHOT_DIR, `${key}.json`);
    const fileContent = await readFile(filePath, "utf-8");
    if (fileContent) {
      const parsed = JSON.parse(fileContent);
      serverCache.set(`snapshot_${key}`, parsed, 60, [key]);
      return parsed as T;
    }
  } catch (e) {
    // Disk file might not exist
  }

  return null;
}

/**
 * Call this function whenever an admin modifies products, categories, settings, banners, or theme.
 */
export async function triggerSnapshotRebuild(): Promise<StorefrontSnapshots | null> {
  serverCache.invalidateTag("products");
  serverCache.invalidateTag("home");
  serverCache.invalidateTag("categories");
  serverCache.invalidateTag("settings");
  serverCache.invalidateTag("theme");
  return generateStorefrontSnapshots();
}

