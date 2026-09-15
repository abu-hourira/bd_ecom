// app/api/storefront/recipes/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Increment view count
    prisma.recipe.update({
      where: { id: recipe.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    // Resolve linked products
    let linkedProducts: any[] = [];
    const ids = Array.isArray(recipe.linkedProductIds)
      ? (recipe.linkedProductIds as number[])
      : [];

    if (ids.length > 0) {
      linkedProducts = await prisma.product.findMany({
        where: {
          id: { in: ids },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountPrice: true,
          unit: true,
          unitQuantity: true,
          images: true,
          stockQuantity: true,
          organicCertified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      recipe,
      linkedProducts,
    });
  } catch (error: any) {
    console.error("[Single Recipe GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
