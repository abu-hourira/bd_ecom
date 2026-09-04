// app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSessionToken } from "@/lib/authSession";

export async function POST(request: NextRequest) {
  try {
    // Check feature flag
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "phone_otp_login" },
    });
    if (flag && !flag.isEnabled) {
      return NextResponse.json(
        { error: "Phone OTP authentication is currently disabled." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phone, otpCode } = body;

    if (!phone || !otpCode) {
      return NextResponse.json({ error: "Phone number and OTP code are required" }, { status: 400 });
    }

    const rawPhone = phone.trim();
    const cleanOtp = otpCode.trim();

    const digitsOnly = rawPhone.replace(/\D/g, "");
    let cleanPhone = rawPhone;
    if (digitsOnly.length === 11 && digitsOnly.startsWith("01")) {
      cleanPhone = digitsOnly;
    } else if (digitsOnly.length === 13 && digitsOnly.startsWith("8801")) {
      cleanPhone = "0" + digitsOnly.slice(2);
    }

    const phoneVariations = [
      cleanPhone,
      `+88${cleanPhone}`,
      `88${cleanPhone}`,
      rawPhone,
    ];
    const uniquePhones = Array.from(new Set(phoneVariations));

    const user = await prisma.user.findFirst({
      where: {
        OR: uniquePhones.map((p) => ({ phone: p })),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this phone number" }, { status: 404 });
    }

    if (!user.otpCode || user.otpCode !== cleanOtp) {
      return NextResponse.json({ error: "Invalid OTP code entered." }, { status: 400 });
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "OTP code has expired. Please request a new code." }, { status: 400 });
    }

    // Clear OTP & mark verified
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        isPhoneVerified: true,
        failedAttempts: 0,
        lockedUntil: null,
      },
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
      },
    });

    const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(updated.role);

    const token = createSessionToken({
      userId: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Phone OTP verified successfully.",
      user: updated,
      token,
      isStaff,
      redirect: isStaff ? "/admin" : "/account/profile",
    });

    // Set secure HTTP session cookie
    response.cookies.set("enmar_session", token, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("enmar_role", updated.role, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[OTP Verify Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
