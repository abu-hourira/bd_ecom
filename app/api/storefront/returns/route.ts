// app/api/storefront/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingId, reason, returnType, photos } = body;

    if (!trackingId || !reason?.trim()) {
      return NextResponse.json({ error: "Tracking ID and reason are required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { trackingId: trackingId.trim().toUpperCase() },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found with provided tracking ID." }, { status: 404 });
    }

    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        trackingId: order.trackingId,
        reason: reason.trim(),
        returnType: returnType || "REFUND",
        photos: photos || [],
        status: "REQUESTED",
        refundAmount: order.totalAmount,
      },
    });

    await prisma.returnTimeline.create({
      data: {
        returnId: returnReq.id,
        status: "REQUESTED",
        note: `Return/Refund request submitted by customer for Order #${order.orderNumber}`,
        actorName: order.customerName,
      },
    });

    return NextResponse.json({ success: true, returnRequest: returnReq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
