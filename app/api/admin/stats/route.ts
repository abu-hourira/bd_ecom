// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      lowStockProducts,
      recentOrders,
      deliveredOrders,
      pendingOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 10 } },
        select: { id: true, name: true, stockQuantity: true, price: true, unit: true },
        take: 8,
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.aggregate({
        where: { orderStatus: "DELIVERED" },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { orderStatus: "PENDING" },
      }),
    ]);

    const totalRevenue = Number(deliveredOrders._sum.totalAmount || 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error("[Stats API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
