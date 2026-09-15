// app/api/user/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("enmar_token")?.value;
    const auth = token ? await verifyJwtToken(token) : null;

    if (!auth || !auth.userId) {
      return NextResponse.json({ success: true, subscriptions: [] });
    }

    const subscriptions = await prisma.customerSubscription.findMany({
      where: { userId: auth.userId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, subscriptions });
  } catch (error: any) {
    return NextResponse.json({ success: true, subscriptions: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("enmar_token")?.value;
    const auth = token ? await verifyJwtToken(token) : null;

    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, status } = body;

    const sub = await prisma.customerSubscription.findFirst({
      where: { id: Number(subscriptionId), userId: auth.userId },
    });

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const updated = await prisma.customerSubscription.update({
      where: { id: sub.id },
      data: { status },
    });

    return NextResponse.json({ success: true, message: `Subscription status updated to ${status}`, subscription: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
