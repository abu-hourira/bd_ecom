// app/api/account/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json({ error: "User identifier required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email: email.trim().toLowerCase() } : {},
          phone ? { phone: phone.trim() } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        postalCode: true,
        createdAt: true,
        _count: {
          select: { orders: true, wishlist: true, addresses: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, city, address, postalCode, currentPassword, newPassword } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let passwordHashUpdate: string | undefined = undefined;
    if (newPassword?.trim()) {
      if (user.passwordHash) {
        const isValid = await bcrypt.compare(currentPassword || "", user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }
      passwordHashUpdate = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        city: city !== undefined ? city.trim() : undefined,
        address: address !== undefined ? address.trim() : undefined,
        postalCode: postalCode !== undefined ? postalCode.trim() : undefined,
        passwordHash: passwordHashUpdate || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        postalCode: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
