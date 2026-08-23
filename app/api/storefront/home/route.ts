// app/api/storefront/home/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [categories, featuredProducts, comboDeals, siteSettings, theme, banners] =
      await Promise.all([
        prisma.category.findMany({
          where: { isActive: true },
          include: { _count: { select: { products: true } } },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.product.findMany({
          where: { isActive: true },
          include: { category: { select: { id: true, name: true, slug: true } } },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: 12,
        }),
        prisma.product.findMany({
          where: { isActive: true, isCombo: true },
          include: { category: { select: { id: true, name: true, slug: true } } },
          take: 4,
        }),
        prisma.siteSetting.findMany(),
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

    return NextResponse.json(
      {
        success: true,
        categories,
        featuredProducts,
        comboDeals,
        settings: settingsMap,
        theme,
        banners,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Home API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
