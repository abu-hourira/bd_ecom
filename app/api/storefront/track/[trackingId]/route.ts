// app/api/storefront/track/[trackingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    const cleanId = trackingId.trim().toUpperCase();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ trackingId: cleanId }, { orderNumber: cleanId }],
      },
      include: {
        items: true,
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No order found matching this tracking ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("[Tracking API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
