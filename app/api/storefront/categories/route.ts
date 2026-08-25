// app/api/storefront/categories/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cacheKey = "storefront_categories";
    const cached = serverCache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json(
        { success: true, categories: cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        image: true,
        description: true,
        displayOrder: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    serverCache.set(cacheKey, categories, 300, ["categories"]);

    return NextResponse.json(
      { success: true, categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Categories API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
