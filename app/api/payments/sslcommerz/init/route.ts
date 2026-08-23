// app/api/payments/sslcommerz/init/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initiateSSLCommerzPayment } from "@/lib/sslcommerz";

export async function POST(req: NextRequest) {
  try {
    const { orderNumber } = await req.json();

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paymentResponse = await initiateSSLCommerzPayment({
      orderNumber: order.orderNumber,
      trackingId: order.trackingId,
      totalAmount: Number(order.totalAmount),
      customerName: order.customerName,
      customerEmail: order.customerEmail || "customer@enmar.bd",
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress || "Dhaka, Bangladesh",
      deliveryZone: order.deliveryZone || "Inside Dhaka",
      itemCount: order.items.length,
    });

    if (paymentResponse?.status === "SUCCESS" && paymentResponse?.GatewayPageURL) {
      return NextResponse.json({
        success: true,
        gatewayUrl: paymentResponse.GatewayPageURL,
      });
    } else {
      console.error("[SSLCommerz Init Error]:", paymentResponse);
      return NextResponse.json(
        {
          error:
            paymentResponse?.failedreason ||
            "Unable to initiate SSLCommerz session. Falling back to manual verification.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[SSLCommerz Init Exception]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
