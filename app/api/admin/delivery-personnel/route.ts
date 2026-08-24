import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/delivery-personnel - List all delivery riders with active order counts
export async function GET() {
  try {
    const riders = await prisma.deliveryPersonnel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                orderStatus: {
                  in: ["CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"],
                },
              },
            },
          },
        },
      },
    });

    const sanitized = riders.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      vehicleType: r.vehicleType || "Motorbike",
      licenseNumber: r.licenseNumber || "",
      isActive: r.isActive,
      isSharingLocation: r.isSharingLocation,
      currentLat: r.currentLat,
      currentLng: r.currentLng,
      lastLocationUpdate: r.lastLocationUpdate,
      activeOrdersCount: r._count.orders,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ success: true, riders: sanitized });
  } catch (error: any) {
    console.error("[Delivery Personnel GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/delivery-personnel - Create new delivery rider
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, vehicleType, licenseNumber } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Name, phone number, and password are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const existing = await prisma.deliveryPersonnel.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A delivery rider with this phone number already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const rider = await prisma.deliveryPersonnel.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        passwordHash,
        vehicleType: vehicleType || "Motorbike",
        licenseNumber: licenseNumber ? licenseNumber.trim() : null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        licenseNumber: rider.licenseNumber,
        isActive: rider.isActive,
      },
    });
  } catch (error: any) {
    console.error("[Delivery Personnel POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/delivery-personnel - Update rider or toggle active status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, phone, password, vehicleType, licenseNumber, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Rider ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber ? licenseNumber.trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.deliveryPersonnel.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      rider: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        vehicleType: updated.vehicleType,
        licenseNumber: updated.licenseNumber,
        isActive: updated.isActive,
      },
    });
  } catch (error: any) {
    console.error("[Delivery Personnel PUT Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/delivery-personnel - Remove rider (if no active orders)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rider ID is required" }, { status: 400 });
    }

    const riderId = Number(id);

    // Unassign pending orders
    await prisma.order.updateMany({
      where: { deliveryPersonnelId: riderId },
      data: { deliveryPersonnelId: null },
    });

    await prisma.deliveryPersonnel.delete({
      where: { id: riderId },
    });

    return NextResponse.json({ success: true, message: "Delivery personnel removed" });
  } catch (error: any) {
    console.error("[Delivery Personnel DELETE Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
