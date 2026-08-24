// app/api/admin/products/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs selected." }, { status: 400 });
    }

    const numericIds = ids.map(Number).filter((id) => !isNaN(id));

    if (action === "delete") {
      const products = await prisma.product.findMany({
        where: { id: { in: numericIds } },
      });

      if (products.length === 0) {
        return NextResponse.json({ error: "No matching products found." }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        // 1. Archive to Recycle Bin
        for (const p of products) {
          await tx.binItem.create({
            data: {
              entityType: "PRODUCT",
              entityId: p.id,
              title: p.name,
              subtitle: `৳${p.price} | Stock: ${p.stockQuantity}`,
              payload: p as any,
              deletedBy: "Admin",
            },
          });
        }

        // 2. Delete from Product table
        await tx.product.deleteMany({
          where: { id: { in: numericIds } },
        });
      });

      revalidatePath("/", "layout");
      revalidatePath("/products");

      return NextResponse.json({
        success: true,
        message: `Successfully moved ${products.length} products to the Recycle Bin.`,
        count: products.length,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[Bulk Products API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
