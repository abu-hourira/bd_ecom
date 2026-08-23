// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            orderStatus: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => {
      const totalSpend = c.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const lastOrder = c.orders.length > 0 ? c.orders[0].createdAt : null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        createdAt: c.createdAt,
        totalOrders: c.orders.length,
        lifetimeSpend: totalSpend,
        lastOrderDate: lastOrder,
      };
    });

    return NextResponse.json({ success: true, customers: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
