// app/api/admin/backup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "products", "orders", "customers"

    if (type === "products") {
      const products = await prisma.product.findMany({
        include: { category: { select: { name: true } } },
      });

      const csvRows = [
        ["ID", "Name", "Category", "Price", "Discount Price", "Stock", "Unit", "Organic Certified"].join(","),
        ...products.map((p) =>
          [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.category?.name || ""}"`,
            p.price,
            p.discountPrice || "",
            p.stockQuantity,
            p.unit,
            p.organicCertified ? "YES" : "NO",
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvRows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="enmar-products-${Date.now()}.csv"`,
        },
      });
    }

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      });

      const csvRows = [
        ["Order Number", "Tracking ID", "Customer Name", "Phone", "Total Amount", "Payment Method", "Payment Status", "Order Status", "Created At"].join(","),
        ...orders.map((o) =>
          [
            o.orderNumber,
            o.trackingId,
            `"${o.customerName.replace(/"/g, '""')}"`,
            `"${o.customerPhone}"`,
            o.totalAmount,
            o.paymentMethod,
            o.paymentStatus,
            o.orderStatus,
            o.createdAt.toISOString(),
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvRows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="enmar-orders-${Date.now()}.csv"`,
        },
      });
    }

    // Default: summary backup logs
    const [productCount, orderCount, userCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: productCount,
        totalOrders: orderCount,
        totalUsers: userCount,
        lastBackupDate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
