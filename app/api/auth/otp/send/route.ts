// app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    // Check feature flag
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "phone_otp_login" },
    });
    if (flag && !flag.isEnabled) {
      return NextResponse.json(
        { error: "Phone OTP login is currently disabled. Please sign in with email and password." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phone } = body;

    if (!phone?.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const rawPhone = phone.trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");
    
    // Normalize phone number to standard Bangladeshi 11-digit or full format
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

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find existing user with any format
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: uniquePhones.map((p) => ({ phone: p })),
      },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          otpCode,
          otpExpiresAt,
        },
      });
    } else {
      existingUser = await prisma.user.create({
        data: {
          name: `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          email: `phone_${cleanPhone}@enmar.bd`,
          passwordHash: "",
          otpCode,
          otpExpiresAt,
        },
      });
    }

    // Send SMS via notification engine
    await sendSMS(cleanPhone, `Your ENMAR Organic Food login verification code is ${otpCode}. Valid for 5 minutes.`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${cleanPhone}`,
      devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error("[OTP Send Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
