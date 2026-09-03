// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, otpCode, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!token && (!email || !otpCode)) {
      return NextResponse.json(
        { error: "Please provide either the reset token or your email with the 6-digit OTP code." },
        { status: 400 }
      );
    }

    let user = null;
    const now = new Date();

    // 1. Match by direct Token (from email link)
    if (token && token.trim()) {
      user = await (prisma.user as any).findFirst({
        where: {
          resetPasswordToken: token.trim(),
          resetPasswordExpiresAt: { gt: now },
        },
      });
    }

    // 2. Match by Email + 6-Digit OTP Code
    if (!user && email && otpCode) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanOtp = otpCode.trim();

      user = await (prisma.user as any).findFirst({
        where: {
          email: cleanEmail,
          resetPasswordOtp: cleanOtp,
          resetPasswordExpiresAt: { gt: now },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset code / link. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Hash the new password
    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    // 4. Update user in database and clear reset tokens
    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordOtp: null,
        resetPasswordExpiresAt: null,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // 5. Send confirmation email via Gmail
    const confirmHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; }
    .box { max-width: 540px; margin: 20px auto; background: #fff; border-radius: 16px; border: 1px solid #E6DEC6; padding: 32px; color: #2D1E0F; }
    .badge { background: #E2ECD8; color: #1E3824; font-weight: 700; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <span class="badge">✓ Security Notice</span>
    <h2 style="color: #1E3824; margin-top: 14px;">Your Password Has Been Reset</h2>
    <p>Assalamu Alaikum ${user.name || "Customer"},</p>
    <p>The password for your ENMAR account (<strong>${user.email}</strong>) was successfully updated just now.</p>
    <p>If you made this change, you can now log in with your new password.</p>
    <p style="color: #A0522D; font-size: 12px; margin-top: 24px;">If you did not make this change, please contact our support team immediately at +880 1614 113082.</p>
  </div>
</body>
</html>
    `;

    await sendEmail(
      user.email,
      "✅ Password Successfully Changed - ENMAR Organic Food",
      confirmHtml
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully! You can now log in.",
    });
  } catch (error: any) {
    console.error("[Reset Password Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
