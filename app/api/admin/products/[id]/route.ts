import { revalidatePath } from "next/cache";
// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { serverCache } from "@/lib/serverCache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const {
      name,
      categoryId,
      subcategory,
      price,
      discountPrice,
      stockQuantity,
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
      isActive,
    } = body;

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
      const duplicate = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (duplicate) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name !== undefined ? name : existing.name,
        slug,
        categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existing.categoryId,
        subcategory: subcategory !== undefined ? subcategory : existing.subcategory,
        price: price !== undefined ? Number(price) : existing.price,
        discountPrice: discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : existing.discountPrice,
        stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : existing.stockQuantity,
        unit: unit !== undefined ? unit : existing.unit,
        images: images !== undefined ? (Array.isArray(images) ? images : []) : (existing.images as any),
        description: description !== undefined ? description : existing.description,
        shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
        organicCertified: organicCertified !== undefined ? Boolean(organicCertified) : existing.organicCertified,
        isCombo: isCombo !== undefined ? Boolean(isCombo) : existing.isCombo,
        comboProductIds: comboProductIds !== undefined ? comboProductIds : (existing.comboProductIds as any),
        savingsPercentage: savingsPercentage !== undefined ? (savingsPercentage ? Number(savingsPercentage) : null) : existing.savingsPercentage,
        badge: badge !== undefined ? badge : existing.badge,
        featured: featured !== undefined ? Boolean(featured) : existing.featured,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath(`/products/${updated.slug}`);
    serverCache.invalidateTag("products");
    serverCache.invalidateTag("home");
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("[Product PUT Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.$transaction(
      async (tx) => {
        // 1. Archive into recycle bin
        await tx.binItem.create({
          data: {
            entityType: "PRODUCT",
            entityId: productId,
            title: product.name,
            subtitle: `৳${product.price} | Stock: ${product.stockQuantity}`,
            payload: product as any,
            deletedBy: "Admin",
          },
        });

        // 2. Unlink foreign keys safely so delete never fails
        await tx.wishlistItem.deleteMany({ where: { productId } });
        await tx.review.deleteMany({ where: { productId } });
        await tx.orderItem.updateMany({
          where: { productId },
          data: { productId: null },
        });

        // 3. Delete product
        await tx.product.delete({ where: { id: productId } });
      },
      { timeout: 15000 }
    );

    revalidatePath("/", "layout");
    revalidatePath("/products");
    serverCache.invalidateTag("products");
    serverCache.invalidateTag("home");
    return NextResponse.json({
      success: true,
      message: "Product safely moved to recycle bin and deleted",
    });
  } catch (error: any) {
    console.error("[Product DELETE Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
