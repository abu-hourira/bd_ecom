// app/api/storefront/home/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const CACHE_KEY = "storefront_home_payload";
    const cached = serverCache.get<any>(CACHE_KEY);

    if (cached) {
      return NextResponse.json(
        { success: true, ...cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

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
          take: 24,
        }),
        prisma.product.findMany({
          where: { isActive: true, isCombo: true },
          select: PRODUCT_CARD_SELECT,
          orderBy: { createdAt: "desc" },
          take: 6,
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

    const payload = {
      categories,
      featuredProducts,
      comboDeals,
      settings: settingsMap,
      theme,
      banners,
    };

    // Cache in high-speed memory for 300 seconds with tags for instant admin invalidation
    serverCache.set(CACHE_KEY, payload, 300, [
      "home",
      "products",
      "categories",
      "banners",
      "settings",
    ]);

    return NextResponse.json(
      {
        success: true,
        ...payload,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Home API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
