// app/api/payments/sslcommerz/ipn/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = formData.get("tran_id") as string;
    const valId = formData.get("val_id") as string;
    const status = formData.get("status") as string;

    if (!tranId) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: tranId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "VALID" || status === "VALIDATED") {
      let isVerified = true;
      if (valId) {
        try {
          const validation = await validateSSLCommerzPayment(valId);
          if (validation?.status !== "VALID" && validation?.status !== "VALIDATED") {
            isVerified = false;
          }
        } catch (e) {
          console.error("[IPN Validation Warning]:", e);
        }
      }

      if (isVerified) {
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
              note: "Automated IPN payment verification successful.",
              actorRole: "SYSTEM",
              actorName: "SSLCommerz IPN Webhook",
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SSLCommerz IPN Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
