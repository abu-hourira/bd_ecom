// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { notifyOrderStatusChanged } from "@/lib/notifications";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        history: {
          orderBy: { createdAt: "desc" },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
        promoCode: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    const body = await req.json();

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const {
      orderStatus,
      paymentStatus,
      courierPartner,
      courierTrackingId,
      estimatedDelivery,
      adminNotes,
      actorRole = "ADMIN",
      actorName = "Admin",
      statusNote,
    } = body;

    const dataToUpdate: any = {};
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus as PaymentStatus;
    if (courierPartner !== undefined) dataToUpdate.courierPartner = courierPartner;
    if (courierTrackingId !== undefined) dataToUpdate.courierTrackingId = courierTrackingId;
    if (estimatedDelivery !== undefined) dataToUpdate.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    if (adminNotes !== undefined) dataToUpdate.adminNotes = adminNotes;

    const isStatusChanged = orderStatus && orderStatus !== existing.orderStatus;
    if (isStatusChanged) {
      dataToUpdate.orderStatus = orderStatus as OrderStatus;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: dataToUpdate,
      });

      if (isStatusChanged) {
        await tx.orderHistory.create({
          data: {
            orderId: orderId,
            status: orderStatus as OrderStatus,
            note: statusNote || `Status updated to ${orderStatus} by ${actorName}`,
            actorRole: actorRole,
            actorName: actorName,
          },
        });
      }

      return order;
    });

    if (isStatusChanged) {
      notifyOrderStatusChanged(updated, orderStatus, statusNote).catch((err) =>
        console.error("[notifyOrderStatusChanged Exception]:", err)
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("[Order PUT Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PATCH = PUT;
