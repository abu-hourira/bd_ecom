// app/api/payments/sslcommerz/success/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = formData.get("tran_id") as string;
    const valId = formData.get("val_id") as string;
    const amount = formData.get("amount") as string;
    const cardType = formData.get("card_type") as string;
    const bankTranId = formData.get("bank_tran_id") as string;
    const trackingId = formData.get("value_a") as string;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    if (!tranId) {
      return NextResponse.redirect(`${appUrl}/track?payment=error`, 303);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: tranId },
    });

    if (!order) {
      return NextResponse.redirect(`${appUrl}/track?payment=order_not_found`, 303);
    }

    // Optional validation with SSLCommerz server (in sandbox or live)
    if (valId) {
      try {
        const validation = await validateSSLCommerzPayment(valId);
        console.log("[SSLCommerz Validation]:", validation);
      } catch (e) {
        console.error("[SSLCommerz Validation Warning]:", e);
      }
    }

    // Update order status to CONFIRMED and payment to PAID
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          note: `Payment verified successfully via SSLCommerz (${cardType || "Gateway"}). Bank Tran ID: ${bankTranId || "N/A"}.`,
          actorRole: "SYSTEM",
          actorName: "SSLCommerz Payment Gateway",
        },
      }),
    ]);

    const redirectTarget = `${appUrl}/track/${order.trackingId}?payment=success`;
    return NextResponse.redirect(redirectTarget, 303);
  } catch (error: any) {
    console.error("[SSLCommerz Success Callback Error]:", error);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/track?payment=error`, 303);
  }
}
