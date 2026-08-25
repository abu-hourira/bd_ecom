// app/api/storefront/track/[trackingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;
    const cleanId = trackingId.trim();
    const isPhone = /(?:\+?88)?01[3-9]\d{8}/.test(cleanId);
    const cleanPhone = isPhone ? cleanId.replace(/^\+?88/, "") : "";
    const cleanTracking = cleanId.toUpperCase();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { trackingId: cleanTracking },
          { orderNumber: cleanTracking },
          ...(cleanPhone ? [{ customerPhone: cleanPhone }, { customerPhone: { contains: cleanPhone } }] : []),
        ],
      },
      include: {
        items: true,
        history: {
          orderBy: { createdAt: "asc" },
        },
        deliveryPersonnel: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            isSharingLocation: true,
            currentLat: true,
            currentLng: true,
            lastLocationUpdate: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No order found matching this tracking ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("[Tracking API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
