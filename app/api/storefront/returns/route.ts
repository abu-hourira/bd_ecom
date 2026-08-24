// app/api/storefront/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingId, reason, returnType, photos, customerName, customerPhone, refundMethod, refundAccount, details } = body;

    if (!trackingId || !reason?.trim()) {
      return NextResponse.json({ error: "Tracking ID and reason are required." }, { status: 400 });
    }

    const cleanTracking = trackingId.trim().toUpperCase();

    const order = await prisma.order.findUnique({
      where: { trackingId: cleanTracking },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found with provided tracking ID." }, { status: 404 });
    }

    // Bug Fix 4: Prevent duplicate active return requests for the same order
    const existingReturn = await prisma.returnRequest.findFirst({
      where: {
        orderId: order.id,
        status: { in: ["REQUESTED", "UNDER_REVIEW", "APPROVED"] },
      },
    });

    if (existingReturn) {
      return NextResponse.json(
        {
          error: "এই অর্ডারের জন্য ইতিমধ্যে একটি রিটার্ন/রিফান্ড আবেদন প্রক্রিয়াধীন রয়েছে। দয়া করে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
        },
        { status: 400 }
      );
    }

    const noteDetails = [
      reason.trim(),
      details ? `Details: ${details}` : "",
      refundMethod ? `Refund via: ${refundMethod} (${refundAccount || "N/A"})` : "",
    ].filter(Boolean).join(" | ");

    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        trackingId: order.trackingId,
        reason: noteDetails,
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
        actorName: customerName || order.customerName,
      },
    });

    return NextResponse.json({ success: true, returnRequest: returnReq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
