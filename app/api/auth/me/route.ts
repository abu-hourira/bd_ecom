// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, isStaffRole } from "@/lib/authSession";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Check enmar_session cookie or Authorization Bearer header
    let token = request.cookies.get("enmar_session")?.value;
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // 2. Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        address: true,
        city: true,
        postalCode: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const isStaff = isStaffRole(user.role);

    return NextResponse.json({
      authenticated: true,
      user,
      isStaff,
    });
  } catch (error: any) {
    console.error("[Auth Me API Error]:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
