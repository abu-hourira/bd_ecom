// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { serverCache } from "@/lib/serverCache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: any = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = Number(categoryId);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("[Products API GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      subcategory,
      price,
      discountPrice,
      stockQuantity,
      unitQuantity,
      unit_quantity,
      unit,
      images,
      description,
      shortDescription,
      organicCertified,
      isCombo,
      comboProductIds,
      savingsPercentage,
      badge,
      featured,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Product name and price are required." }, { status: 400 });
    }

    let slug = slugify(name);
    // Ensure slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const resolvedUnitQty =
      unitQuantity !== undefined && unitQuantity !== null && unitQuantity !== ""
        ? Number(unitQuantity)
        : unit_quantity !== undefined && unit_quantity !== null && unit_quantity !== ""
        ? Number(unit_quantity)
        : null;

    const createData: any = {
      name,
      slug,
      categoryId: categoryId ? Number(categoryId) : null,
      subcategory: subcategory || null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stockQuantity: Number(stockQuantity || 0),
      unit: unit || "piece",
      images: Array.isArray(images) ? images : [],
      description: description || "",
      shortDescription: shortDescription || null,
      organicCertified: organicCertified !== undefined ? Boolean(organicCertified) : true,
      isCombo: Boolean(isCombo),
      comboProductIds: Array.isArray(comboProductIds) ? comboProductIds : undefined,
      savingsPercentage: savingsPercentage ? Number(savingsPercentage) : null,
      badge: badge || null,
      featured: Boolean(featured),
      isActive: true,
    };

    if (resolvedUnitQty !== null && !isNaN(resolvedUnitQty)) {
      createData.unitQuantity = resolvedUnitQty;
    }

    const product = await prisma.product.create({
      data: createData,
    });

    revalidatePath("/", "layout");
    revalidatePath("/products");
    serverCache.invalidateTag("products");
    serverCache.invalidateTag("home");
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("[Products API POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
