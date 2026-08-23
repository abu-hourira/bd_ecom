// app/api/payments/sslcommerz/fail/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = formData.get("tran_id") as string;
    const failedReason = formData.get("error") || formData.get("failedreason") || "Payment failed or was declined.";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    if (!tranId) {
      return NextResponse.redirect(`${appUrl}/track?payment=failed`, 303);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: tranId },
    });

    if (order) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: PaymentStatus.FAILED },
        }),
        prisma.orderHistory.create({
          data: {
            orderId: order.id,
            status: order.orderStatus,
            note: `Payment attempt failed via SSLCommerz: ${failedReason}`,
            actorRole: "SYSTEM",
            actorName: "SSLCommerz Payment Gateway",
          },
        }),
      ]);

      return NextResponse.redirect(`${appUrl}/track/${order.trackingId}?payment=failed`, 303);
    }

    return NextResponse.redirect(`${appUrl}/track?payment=failed`, 303);
  } catch (error: any) {
    console.error("[SSLCommerz Fail Callback Error]:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/track?payment=failed`, 303);
  }
}
