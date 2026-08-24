// app/api/admin/bin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const { action, id, ids } = body;

    // 1. Empty entire bin
    if (action === "empty_all") {
      const deleted = await prisma.binItem.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Successfully purged all ${deleted.count} items permanently.`,
      });
    }

    // 2. Bulk Restore
    if (action === "bulk_restore") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No item IDs selected." }, { status: 400 });
      }

      const numericIds = ids.map(Number).filter((n) => !isNaN(n));
      const binItems = await prisma.binItem.findMany({
        where: { id: { in: numericIds } },
      });

      for (const item of binItems) {
        const payload: any = item.payload || {};
        if (item.entityType.toUpperCase() === "PRODUCT") {
          const slug = payload.slug || `restored-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await prisma.product.upsert({
            where: { id: item.entityId },
            update: {
              isActive: true,
              name: payload.name || item.title,
              price: payload.price || 0,
              discountPrice: payload.discountPrice || null,
              stockQuantity: payload.stockQuantity || 10,
              unit: payload.unit || "piece",
              description: payload.description || "",
              images: payload.images || [],
              categoryId: payload.categoryId || 1,
            },
            create: {
              id: item.entityId,
              name: payload.name || item.title,
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
        } else if (item.entityType.toUpperCase() === "CATEGORY") {
          const slug = payload.slug || `cat-${Date.now()}`;
          await prisma.category.upsert({
            where: { id: item.entityId },
            update: { isActive: true, name: payload.name || item.title },
            create: { id: item.entityId, name: payload.name || item.title, slug, isActive: true },
          });
        }
      }

      await prisma.binItem.deleteMany({
        where: { id: { in: numericIds } },
      });

      revalidatePath("/", "layout");
      revalidatePath("/products");

      return NextResponse.json({
        success: true,
        message: `Successfully restored ${binItems.length} items back to active store.`,
      });
    }

    // 3. Bulk Purge
    if (action === "bulk_purge") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No item IDs selected." }, { status: 400 });
      }
      const numericIds = ids.map(Number).filter((n) => !isNaN(n));
      const purged = await prisma.binItem.deleteMany({
        where: { id: { in: numericIds } },
      });

      return NextResponse.json({
        success: true,
        message: `Permanently deleted ${purged.count} items.`,
      });
    }

    // 4. Single item actions
    if (!id) {
      return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
    }

    const binItem = await prisma.binItem.findUnique({
      where: { id: Number(id) },
    });

    if (!binItem) {
      return NextResponse.json({ error: "Item not found in bin." }, { status: 404 });
    }

    if (action === "purge") {
      await prisma.binItem.delete({ where: { id: binItem.id } });
      return NextResponse.json({
        success: true,
        message: `Item "${binItem.title}" permanently removed.`,
      });
    }

    if (action === "restore") {
      const payload: any = binItem.payload || {};
      if (binItem.entityType.toUpperCase() === "PRODUCT") {
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
      }

      await prisma.binItem.delete({ where: { id: binItem.id } });
      revalidatePath("/", "layout");
      revalidatePath("/products");

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
