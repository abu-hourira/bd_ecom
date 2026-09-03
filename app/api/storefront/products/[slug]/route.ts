// app/api/storefront/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cacheKey = `storefront_product_${slug}`;
    const cached = serverCache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json(
        { success: true, ...cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
          },
        }
      );
    }

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

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Related products in same category (lightweight projection)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
        select: {
          id: true,
          name: true,
          slug: true,
          categoryId: true,
          price: true,
          discountPrice: true,
          stockQuantity: true,
          unitQuantity: true,
          unit: true,
          images: true,
          organicCertified: true,
          isCombo: true,
          badge: true,
          featured: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        } as any,
      take: 4,
    });

    const payload = { product, related: relatedProducts };
    serverCache.set(cacheKey, payload, 120, ["products"]);

    return NextResponse.json(
      { success: true, ...payload },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Product Slug API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
