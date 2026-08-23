// app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    const cleanPhone = phone.trim();
    const cleanOtp = otpCode.trim();

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone OTP verified successfully.",
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
