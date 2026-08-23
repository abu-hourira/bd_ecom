// app/api/account/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: Number(userId) },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            discountPrice: true,
            images: true,
            stockQuantity: true,
            unit: true,
            organicCertified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, wishlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID required" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: Number(productId),
        },
      },
      update: {},
      create: {
        userId: Number(userId),
        productId: Number(productId),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID required" }, { status: 400 });
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: Number(productId),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
