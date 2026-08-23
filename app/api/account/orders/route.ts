// app/api/account/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const userId = searchParams.get("userId");

    if (!email && !phone && !userId) {
      return NextResponse.json({ error: "Customer identifier required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          userId ? { userId: Number(userId) } : {},
          email ? { customerEmail: email.trim().toLowerCase() } : {},
          phone ? { customerPhone: phone.trim() } : {},
        ],
      },
      include: {
        items: true,
        history: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
