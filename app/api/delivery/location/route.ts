import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// POST /api/delivery/location - Update Rider Live GPS Location
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("enmar_delivery_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized rider session" }, { status: 401 });
    }

    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf8")
    );

    const body = await req.json();
    const { lat, lng, isSharing } = body;

    const updateData: any = {
      isSharingLocation: Boolean(isSharing),
    };

    if (lat !== undefined && lng !== undefined && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      updateData.currentLat = Number(lat);
      updateData.currentLng = Number(lng);
      updateData.lastLocationUpdate = new Date();
    }

    const updated = await prisma.deliveryPersonnel.update({
      where: { id: payload.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      isSharing: updated.isSharingLocation,
      currentLat: updated.currentLat,
      currentLng: updated.currentLng,
      lastLocationUpdate: updated.lastLocationUpdate,
    });
  } catch (error: any) {
    console.error("[Delivery Location POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
