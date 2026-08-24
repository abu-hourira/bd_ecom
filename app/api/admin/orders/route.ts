// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== ("ALL" as any)) {
      where.orderStatus = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { trackingId: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
        deliveryPersonnel: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            isSharingLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("[Orders API GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
