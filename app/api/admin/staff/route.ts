import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const staffMembers = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.MODERATOR],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        twoFactorEnabled: true,
        failedAttempts: true,
        lockedUntil: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const permissions = await prisma.rolePermission.findMany();

    return NextResponse.json({
      success: true,
      staff: staffMembers,
      permissions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role, password, twoFactorEnabled } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newStaff = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: role || Role.MANAGER,
        twoFactorEnabled: Boolean(twoFactorEnabled),
        isEmailVerified: true,
      },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
