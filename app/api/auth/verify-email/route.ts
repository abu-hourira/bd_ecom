// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: "Email address and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified. You can now log in.",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }

    if (!user.otpCode || user.otpCode !== cleanCode) {
      return NextResponse.json({ error: "Invalid verification code. Please check your email and try again." }, { status: 400 });
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new code." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Account is now active.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[Verify Email Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
