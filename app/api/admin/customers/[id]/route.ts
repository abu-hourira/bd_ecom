// app/api/admin/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        addresses: true,
        orders: {
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
        },
        returnRequests: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const totalSpend = customer.orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        lifetimeSpend: totalSpend,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
