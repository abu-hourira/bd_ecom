// app/api/admin/orders/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 });
    }

    const orderIds = ids.map(Number).filter((id) => !isNaN(id));

    await prisma.$transaction(async (tx) => {
      await tx.orderHistory.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.orderMessage.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.returnRequest.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.order.deleteMany({ where: { id: { in: orderIds } } });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${orderIds.length} order(s) from history.`,
      count: orderIds.length,
    });
  } catch (error: any) {
    console.error("[Bulk Orders DELETE Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
