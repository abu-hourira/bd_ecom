// lib/server/storefront-data.ts
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

const PRODUCT_CARD_SELECT = {
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
  shortDescription: true,
  organicCertified: true,
  isCombo: true,
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
    select: { id: true, name: true, slug: true },
  },
} as any;

function serializePrisma(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    })
  );
}

export async function getStorefrontHomeData() {
  const CACHE_KEY = "server_storefront_home_data_v1";
  const cached = serverCache.get<any>(CACHE_KEY);
  if (cached) return cached;

  try {
    const [categories, featuredProducts, comboDeals, siteSettings, theme, banners] =
      await Promise.all([
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
          select: PRODUCT_CARD_SELECT,
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: 36,
        }),
        prisma.product.findMany({
          where: { isActive: true, isCombo: true },
          select: PRODUCT_CARD_SELECT,
          orderBy: { createdAt: "desc" },
          take: 8,
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
      ]);

    const settingsMap: Record<string, string> = {};
    siteSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const payload = serializePrisma({
      categories,
      featuredProducts,
      comboDeals,
      settings: settingsMap,
      theme,
      banners,
    });

    serverCache.set(CACHE_KEY, payload, 60, ["products", "categories", "banners", "settings"]);
    return payload;
  } catch (error) {
    console.error("[getStorefrontHomeData Error]:", error);
    return {
      categories: [],
      featuredProducts: [],
      comboDeals: [],
      settings: {},
      theme: null,
      banners: [],
    };
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  const CACHE_KEY = `server_product_${slug}`;
  const cached = serverCache.get<any>(CACHE_KEY);
  if (cached) return cached;

  try {
    const rawSlug = String(slug || "").trim();
    let decodedSlug = rawSlug;
    try {
      decodedSlug = decodeURIComponent(rawSlug).trim();
    } catch (e) {}

    const isNumeric = !isNaN(Number(rawSlug)) && Number(rawSlug) > 0;
    const numericId = isNumeric ? Number(rawSlug) : null;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: decodedSlug },
          ...(numericId ? [{ id: numericId }] : []),
        ],
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) return { product: null, related: [] };

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      select: PRODUCT_CARD_SELECT,
      take: 4,
    });

    const payload = serializePrisma({
      product,
      related,
    });

    serverCache.set(CACHE_KEY, payload, 120, ["products"]);
    return payload;
  } catch (error) {
    console.error(`[getStorefrontProductBySlug ${slug} Error]:`, error);
    return { product: null, related: [] };
  }
}
