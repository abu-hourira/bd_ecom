import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// POST /api/delivery/auth - Driver Login
export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone number and password/PIN are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const rider = await prisma.deliveryPersonnel.findUnique({
      where: { phone: cleanPhone },
    });

    if (!rider) {
      return NextResponse.json(
        { error: "Invalid phone number or rider account not found" },
        { status: 401 }
      );
    }

    if (!rider.isActive) {
      return NextResponse.json(
        { error: "Your rider account is deactivated. Please contact store management." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, rider.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect password or PIN" },
        { status: 401 }
      );
    }

    // Set signed cookie session payload
    const sessionPayload = Buffer.from(
      JSON.stringify({
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        loginAt: Date.now(),
      })
    ).toString("base64");

    const cookieStore = await cookies();
    cookieStore.set("enmar_delivery_session", sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        isSharingLocation: rider.isSharingLocation,
      },
    });
  } catch (error: any) {
    console.error("[Delivery Auth POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/delivery/auth - Check active session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("enmar_delivery_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf8")
    );

    const rider = await prisma.deliveryPersonnel.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        phone: true,
        vehicleType: true,
        isActive: true,
        isSharingLocation: true,
        currentLat: true,
        currentLng: true,
        lastLocationUpdate: true,
      },
    });

    if (!rider || !rider.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      rider,
    });
  } catch (error: any) {
    console.error("[Delivery Auth GET Error]:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE /api/delivery/auth - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("enmar_delivery_session");

    if (sessionCookie && sessionCookie.value) {
      try {
        const payload = JSON.parse(
          Buffer.from(sessionCookie.value, "base64").toString("utf8")
        );
        // Turn off location sharing on logout
        await prisma.deliveryPersonnel.update({
          where: { id: payload.id },
          data: { isSharingLocation: false },
        });
      } catch (e) {}
    }

    cookieStore.delete("enmar_delivery_session");
    return NextResponse.json({ success: true, message: "Logged out" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
