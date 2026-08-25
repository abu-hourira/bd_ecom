// app/api/v1/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const apiKeyHeader = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!apiKeyHeader) {
      return NextResponse.json(
        { error: "Unauthorized: Missing 'x-api-key' header" },
        { status: 401 }
      );
    }

    // Hash key with SHA-256 to compare with stored keyHash
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

    // Log request asynchronously
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "API Client";

    prisma.aPIKey
      .update({
        where: { id: keyRecord.id },
        data: {
          requestCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      })
      .catch((e) => console.error("[API v1] Usage count update error:", e));

    prisma.aPIAccessLog
      .create({
        data: {
          apiKeyId: keyRecord.id,
          endpoint: "/api/v1/products",
          ipAddress: ip,
          userAgent: userAgent,
          status: 200,
        },
      })
      .catch((e) => console.error("[API v1] Log error:", e));

    // Fetch public-safe product data only
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      meta: {
        total: products.length,
        brand: "ENMAR Organic Food Bangladesh",
        timestamp: new Date().toISOString(),
      },
      data: products,
    });
  } catch (error: any) {
    console.error("[API v1 Products] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
