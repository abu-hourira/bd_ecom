// app/api/v1/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKeyHeader = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!apiKeyHeader) {
      return NextResponse.json(
        { error: "Unauthorized: Missing 'x-api-key' header" },
        { status: 401 }
      );
    }

    const keyHash = crypto.createHash("sha256").update(apiKeyHeader).digest("hex");
    const keyRecord = await prisma.aPIKey.findUnique({
      where: { keyHash },
    });

    if (!keyRecord || !keyRecord.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Invalid or inactive API key" },
        { status: 403 }
      );
    }

    const productId = parseInt(id, 10);
    const product = await prisma.product.findFirst({
      where: isNaN(productId)
        ? { slug: id, isActive: true }
        : { id: productId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        price: true,
        discountPrice: true,
        stockQuantity: true,
        unitQuantity: true,
        unit: true,
        images: true,
        description: true,
        shortDescription: true,
        organicCertified: true,
        badge: true,
        isCombo: true,
        createdAt: true,
      } as any,
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or not published" },
        { status: 404 }
      );
    }

    // Increment log
    prisma.aPIKey.update({
      where: { id: keyRecord.id },
      data: { requestCount: { increment: 1 }, lastUsedAt: new Date() },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("[API v1 Product Detail] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
