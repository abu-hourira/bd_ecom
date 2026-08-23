// app/api/admin/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReturnStatus } from "@prisma/client";

export async function GET() {
  try {
    const returns = await prisma.returnRequest.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            totalAmount: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, returns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { returnId, status, adminNotes, refundAmount } = body;

    const updated = await prisma.returnRequest.update({
      where: { id: parseInt(returnId, 10) },
      data: {
        status: status as ReturnStatus,
        adminNotes: adminNotes || undefined,
        refundAmount: refundAmount !== undefined ? Number(refundAmount) : undefined,
      },
    });

    await prisma.returnTimeline.create({
      data: {
        returnId: updated.id,
        status: status as ReturnStatus,
        note: adminNotes || `Status updated to ${status} by admin`,
        actorName: "Support Admin",
      },
    });

    return NextResponse.json({ success: true, returnRequest: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
