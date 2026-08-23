// app/api/storefront/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const organicOnly = searchParams.get("organicOnly") === "true";
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const sort = searchParams.get("sort") || "newest";

    const where: any = { isActive: true };

    if (category && category !== "all") {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (organicOnly) {
      where.organicCertified = true;
    }

    if (inStockOnly) {
      where.stockQuantity = { gt: 0 };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };
    if (sort === "popular") orderBy = { featured: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
    });

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Products API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
