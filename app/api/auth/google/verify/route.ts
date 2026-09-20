// app/api/auth/google/verify/route.ts - Fast Client-side Token / One-Tap Verification
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/authSession";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential token" }, { status: 400 });
    }

    // 1. Verify token with Google TokenInfo API
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    const payload = await verifyRes.json();

    if (!verifyRes.ok || !payload.email) {
      return NextResponse.json(
        { error: payload.error_description || "Invalid Google credential" },
        { status: 401 }
      );
    }

    const cleanEmail = String(payload.email).toLowerCase().trim();
    const googleId = String(payload.sub);
    const fullName = (payload.name || cleanEmail.split("@")[0]).trim();
    const avatarUrl = payload.picture || null;

    // 2. Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email: cleanEmail }],
      },
    });

    if (user) {
      const updateData: any = {};
      if (!user.googleId) updateData.googleId = googleId;
      if (!user.avatar && avatarUrl) updateData.avatar = avatarUrl;
      if (!user.isEmailVerified) updateData.isEmailVerified = true;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: fullName,
          email: cleanEmail,
          googleId,
          avatar: avatarUrl,
          role: Role.CUSTOMER,
          isEmailVerified: true,
        },
      });
    }

    // 3. Issue session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(user.role);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
      redirect: isStaff ? "/admin" : "/account/profile",
    });

    response.cookies.set("enmar_session", token, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("enmar_role", user.role, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("[Google Verify Error]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
