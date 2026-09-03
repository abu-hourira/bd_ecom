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

import { getStorefrontSnapshot } from "@/lib/snapshotEngine";

export async function getStorefrontHomeData() {
  const snapshot = await getStorefrontSnapshot<any>("home");
  if (snapshot) return snapshot;

  return {
    categories: [],
    featuredProducts: [],
    comboDeals: [],
    settings: {},
    theme: null,
    banners: [],
  };
}

export async function getStorefrontProductBySlug(slug: string) {
  const rawSlug = String(slug || "").trim();
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug).trim();
  } catch (e) {}

  const isNumeric = !isNaN(Number(rawSlug)) && Number(rawSlug) > 0;
  const numericId = isNumeric ? Number(rawSlug) : null;

  const CACHE_KEY = `server_product_${decodedSlug}`;
  const cached = serverCache.get<any>(CACHE_KEY);
  if (cached) return cached;

  // 1. Instant Snapshot RAM/Disk Lookup (0.1ms)
  try {
    const allProducts = await getStorefrontSnapshot<any[]>("products");
    if (allProducts && Array.isArray(allProducts)) {
      const found = allProducts.find(
        (p) =>
          p.slug === rawSlug ||
          p.slug === decodedSlug ||
          (numericId && p.id === numericId)
      );

      if (found) {
        const related = allProducts
          .filter((p) => p.categoryId === found.categoryId && p.id !== found.id)
          .slice(0, 4);

        const payload = { product: found, related };
        serverCache.set(CACHE_KEY, payload, 300, ["products"]);
        return payload;
      }
    }
  } catch (e) {}

  // 2. Database Fallback
  try {
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

    serverCache.set(CACHE_KEY, payload, 300, ["products"]);
    return payload;
  } catch (error) {
    console.error(`[getStorefrontProductBySlug ${slug} Error]:`, error);
    return { product: null, related: [] };
  }
}
