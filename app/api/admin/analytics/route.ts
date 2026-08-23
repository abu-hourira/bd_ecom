// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30"; // days

    const days = parseInt(range, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [orders, products, categories, totalCustomers] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        include: {
          items: {
            include: {
              product: {
                select: { categoryId: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.findMany({
        include: {
          category: { select: { name: true } },
          orderItems: { select: { quantity: true, totalPrice: true } },
        },
      }),
      prisma.category.findMany({
        include: {
          products: {
            include: {
              orderItems: { select: { quantity: true, totalPrice: true } },
            },
          },
        },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    // 1. Total Revenue & AOV
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 2. Revenue Over Time (Daily aggregation)
    const dailyRevenueMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyRevenueMap[key] = {
        date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        revenue: 0,
        orders: 0,
      };
    }

    orders.forEach((o) => {
      const key = o.createdAt.toISOString().split("T")[0];
      if (dailyRevenueMap[key]) {
        dailyRevenueMap[key].revenue += Number(o.totalAmount || 0);
        dailyRevenueMap[key].orders += 1;
      }
    });

    const revenueTimeline = Object.values(dailyRevenueMap);

    // 3. Category Sales Breakdown
    const categorySales = categories.map((cat) => {
      let revenue = 0;
      let units = 0;
      cat.products.forEach((p) => {
        p.orderItems.forEach((oi) => {
          revenue += Number(oi.totalPrice || 0);
          units += oi.quantity;
        });
      });
      return {
        id: cat.id,
        name: cat.name,
        revenue,
        units,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // 4. Top Selling Products
    const topProducts = products.map((p) => {
      const unitsSold = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
      const totalSales = p.orderItems.reduce((sum, oi) => sum + Number(oi.totalPrice || 0), 0);
      return {
        id: p.id,
        name: p.name,
        category: p.category?.name || "General",
        price: p.price,
        stock: p.stockQuantity,
        unitsSold,
        totalSales,
      };
    }).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

    // 5. Order Status Distribution
    const statusDistribution: Record<string, number> = {};
    orders.forEach((o) => {
      statusDistribution[o.orderStatus] = (statusDistribution[o.orderStatus] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        aov,
        totalCustomers,
        revenueTimeline,
        categorySales,
        topProducts,
        statusDistribution,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
