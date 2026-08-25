// app/api/storefront/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Edge CDN ISR Cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const organicOnly =
      searchParams.get("organicOnly") === "true" ||
      searchParams.get("organic") === "true";
    const inStockOnly =
      searchParams.get("inStockOnly") === "true" ||
      searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10))
    );
    const skip = (page - 1) * limit;

    const cacheKey = `storefront_products_${req.url}`;
    const cachedResponse = serverCache.get<{
      products: any[];
      pagination: any;
    }>(cacheKey);

    if (cachedResponse) {
      return NextResponse.json(
        { success: true, ...cachedResponse },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const where: any = { isActive: true };

    if (category && category !== "all") {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
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

    let orderBy: any = [{ featured: "desc" }, { createdAt: "desc" }];
    if (sort === "price-asc" || sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price-desc" || sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "newest") orderBy = { createdAt: "desc" };
    if (sort === "featured" || sort === "popular")
      orderBy = [{ featured: "desc" }, { createdAt: "desc" }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
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
          createdAt: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total,
    };

    serverCache.set(cacheKey, { products, pagination }, 60, ["products"]);

    return NextResponse.json(
      { success: true, products, pagination },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Products API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
