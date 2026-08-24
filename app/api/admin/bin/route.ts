// app/api/admin/bin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "PRODUCT", "CATEGORY", "PROMO", "ALL"

    const where: any = {};
    if (type && type !== "ALL") {
      where.entityType = type;
    }

    const items = await prisma.binItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const [productCount, categoryCount, promoCount] = await Promise.all([
      prisma.binItem.count({ where: { entityType: "PRODUCT" } }),
      prisma.binItem.count({ where: { entityType: "CATEGORY" } }),
      prisma.binItem.count({ where: { entityType: "PROMO" } }),
    ]);

    return NextResponse.json({
      success: true,
      items,
      stats: {
        total: items.length,
        products: productCount,
        categories: categoryCount,
        promos: promoCount,
      },
    });
  } catch (error: any) {
    console.error("[Bin API GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id } = body;

    // 1. Empty entire bin
    if (action === "empty_all") {
      const deleted = await prisma.binItem.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Successfully purged ${deleted.count} items permanently.`,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
    }

    const binItem = await prisma.binItem.findUnique({
      where: { id: Number(id) },
    });

    if (!binItem) {
      return NextResponse.json({ error: "Item not found in bin." }, { status: 404 });
    }

    // 2. Permanently delete single item
    if (action === "purge") {
      await prisma.binItem.delete({ where: { id: binItem.id } });
      return NextResponse.json({
        success: true,
        message: `Item "${binItem.title}" permanently removed.`,
      });
    }

    // 3. Restore item
    if (action === "restore") {
      const payload: any = binItem.payload || {};

      if (binItem.entityType === "PRODUCT") {
        const slug = payload.slug || `restored-${Date.now()}`;
        await prisma.product.upsert({
          where: { id: binItem.entityId },
          update: {
            isActive: true,
            name: payload.name || binItem.title,
            price: payload.price || 0,
            discountPrice: payload.discountPrice || null,
            stockQuantity: payload.stockQuantity || 10,
            unit: payload.unit || "piece",
            description: payload.description || "",
            images: payload.images || [],
            categoryId: payload.categoryId || 1,
          },
          create: {
            id: binItem.entityId,
            name: payload.name || binItem.title,
            slug,
            price: payload.price || 0,
            discountPrice: payload.discountPrice || null,
            stockQuantity: payload.stockQuantity || 10,
            unit: payload.unit || "piece",
            description: payload.description || "",
            images: payload.images || [],
            categoryId: payload.categoryId || 1,
            isActive: true,
          },
        });
      } else if (binItem.entityType === "CATEGORY") {
        const slug = payload.slug || `cat-${Date.now()}`;
        await prisma.category.upsert({
          where: { id: binItem.entityId },
          update: {
            isActive: true,
            name: payload.name || binItem.title,
          },
          create: {
            id: binItem.entityId,
            name: payload.name || binItem.title,
            slug,
            description: payload.description || "",
            isActive: true,
          },
        });
      } else if (binItem.entityType === "PROMO") {
        const code = payload.code || `PROMO${Date.now()}`;
        await prisma.promoCode.upsert({
          where: { id: binItem.entityId },
          update: {
            isActive: true,
            code: code,
          },
          create: {
            id: binItem.entityId,
            code: code,
            discountType: payload.discountType || "PERCENTAGE",
            discountValue: payload.discountValue || 10,
            minOrderAmount: payload.minOrderAmount || 0,
            isActive: true,
          },
        });
      }

      await prisma.binItem.delete({ where: { id: binItem.id } });

      return NextResponse.json({
        success: true,
        message: `Successfully restored "${binItem.title}" back to active catalog.`,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[Bin API POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
