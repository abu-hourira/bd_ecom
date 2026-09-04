// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/authSession";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password) {
      return NextResponse.json(
        { error: "Email or phone number and password are required" },
        { status: 400 }
      );
    }

    const rawInput = identifier.trim();
    const cleanEmail = rawInput.toLowerCase();

    // Generate phone variations (01xxxxxxxxx, +8801xxxxxxxxx, 8801xxxxxxxxx)
    const digitsOnly = rawInput.replace(/\D/g, "");
    const phoneVariations: string[] = [rawInput];

    if (digitsOnly.length >= 10) {
      if (digitsOnly.startsWith("8801")) {
        const local = "0" + digitsOnly.slice(2);
        phoneVariations.push(local, "+" + digitsOnly, digitsOnly);
      } else if (digitsOnly.startsWith("01")) {
        phoneVariations.push(digitsOnly, "+88" + digitsOnly, "88" + digitsOnly);
      } else if (digitsOnly.startsWith("1") && digitsOnly.length === 10) {
        const local = "0" + digitsOnly;
        phoneVariations.push(local, "+88" + local, "88" + local);
      }
    }

    const uniquePhones = Array.from(new Set(phoneVariations));

    // Find by email or any phone format
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...uniquePhones.map((p) => ({ phone: p })),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid login credentials. No account found with this email or phone number." },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error: "This account was created via Phone OTP and does not have a password yet. Please sign in via Phone OTP or reset your password.",
          isOtpAccount: true,
        },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account is temporarily locked due to failed attempts. Try again in ${minutesLeft} minute(s).` },
        { status: 403 }
      );
    }

    // Verify Password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      const failed = user.failedAttempts + 1;
      let lockedUntil = null;
      if (failed >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: failed,
          lockedUntil,
        },
      });

      return NextResponse.json(
        { error: failed >= 5 ? "Account locked for 15 minutes due to 5 failed attempts." : "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(user.role);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      city: user.city,
      address: user.address,
      postalCode: user.postalCode,
    };

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token,
      isStaff,
      redirect: isStaff ? "/admin" : "/account/profile",
    });

    // Set secure HTTP session cookie
    response.cookies.set("enmar_session", token, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
      httpOnly: false, // Accessible to client and server
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("enmar_role", user.role, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[Unified Auth Login Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
