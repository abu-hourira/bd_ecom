// app/api/auth/verify-email/resend/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "This email is already verified. You can log in directly." }, { status: 400 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    await sendEmail(
      cleanEmail,
      "Your new ENMAR Verification Code",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #14421a;">ENMAR Email Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Here is your new 6-digit verification code:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #14421a; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #6b7280; font-size: 12px;">Valid for 15 minutes.</p>
      </div>`
    );

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
      devCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
