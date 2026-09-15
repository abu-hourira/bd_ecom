// app/api/storefront/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const where: any = { isApproved: true };
    if (productId) {
      where.productId = Number(productId);
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("[Reviews GET Error]:", error);
    return NextResponse.json({ success: true, reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("enmar_token")?.value;
    const auth = token ? await verifyJwtToken(token) : null;

    const body = await req.json();
    const { productId, userName, userEmail, rating, comment, photos } = body;

    if (!productId || !userName || !comment) {
      return NextResponse.json({ error: "Product, name, and comment are required" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId: Number(productId),
        userId: auth?.userId || null,
        userName,
        userEmail: userEmail || (auth ? auth.email : "customer@enmar.com"),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment,
        photos: photos || [],
        verifiedPurchase: true,
        isApproved: true, // Auto-approve or queue for moderation
      },
    });

    return NextResponse.json({
      success: true,
      message: "ধন্যবাদ! আপনার মূল্যবান রিভিউ সফলভাবে যুক্ত হয়েছে।",
      review,
    });
  } catch (error: any) {
    console.error("[Submit Review Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
