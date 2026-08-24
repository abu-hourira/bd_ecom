// app/api/storefront/orders/[trackingId]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyOrderStatusChanged } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim() || "Customer self-service cancellation";

    const order = await prisma.order.findUnique({
      where: { trackingId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Server-side strict constraint: Only PENDING orders can be cancelled by the customer
    if (order.orderStatus !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: "Self-cancellation is only available while your order is Pending confirmation. Please contact support via WhatsApp/phone for assistance with confirmed or shipped orders.",
        },
        { status: 400 }
      );
    }

    const isPaidOnline = (order.paymentStatus as any) === "PAID" || (order.paymentMethod !== "COD" && (order.paymentStatus as any) === "PAID");
    const refundNeeded = isPaidOnline;
    const refundStatus = isPaidOnline ? "REFUND_NEEDED" : "NOT_APPLICABLE";

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update order status and refund flag
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "CANCELLED",
          cancellationReason: reason,
          refundNeeded,
          refundStatus,
        },
      });

      // 2. Record timeline history
      await tx.orderHistory.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          note: reason,
          actorRole: "CUSTOMER",
          actorName: order.customerName,
        },
      });

      // 3. Restore inventory stock for each item
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    // 4. Send cancellation notification via SMS and Email
    notifyOrderStatusChanged(
      updatedOrder,
      "CANCELLED",
      reason
    ).catch((err) => console.error("[notifyOrderStatusChanged Cancel]:", err));

    return NextResponse.json({
      success: true,
      message: "Order has been cancelled successfully and product inventory has been restored.",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("[Customer Order Cancel Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel order." },
      { status: 500 }
    );
  }
}
