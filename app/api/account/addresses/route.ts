// app/api/account/addresses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: Number(userId) },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, recipientName, phone, streetAddress, area, city, isDefault } = body;

    if (!userId || !recipientName?.trim() || !phone?.trim() || !streetAddress?.trim()) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: Number(userId) },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: Number(userId),
        title: title || "Home",
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        area: area ? area.trim() : null,
        city: city || "Dhaka",
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    await prisma.address.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
