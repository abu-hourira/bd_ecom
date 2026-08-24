// app/api/admin/reset-store/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Delete all dependent transactional and sample data
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.binItem.deleteMany();
    await prisma.orderMessage.deleteMany();
    await prisma.orderHistory.deleteMany();
    await prisma.returnTimeline.deleteMany();
    await prisma.returnRequest.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.promotionBanner.deleteMany();

    return NextResponse.json({
      success: true,
      message: "All sample products, orders, and banners have been cleared successfully.",
    });
  } catch (error: any) {
    console.error("[Reset Store Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
