// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Don't leak whether email exists for security, but return friendly success response
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification code and reset link have been sent.",
      });
    }

    // 2. Generate secure 6-digit OTP and 64-char token
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // 3. Save to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordOtp: otpCode,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    // 4. Construct direct reset URL
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const baseUrl = origin.replace(/\/$/, "");
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    // 5. Construct Beautiful Branded HTML Email
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ENMAR Organic Food</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E6DEC6; box-shadow: 0 4px 20px rgba(45,30,15,0.05); }
    .header { background: #2E5C38; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #E2ECD8; margin: 6px 0 0 0; font-size: 13px; }
    .content { padding: 36px 32px; color: #2D1E0F; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1E3824; }
    .otp-card { background: #F4EAD4; border: 2px dashed #C8A27A; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #6D4C28; margin-bottom: 8px; }
    .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1E3824; font-family: monospace; }
    .otp-validity { font-size: 11px; color: #8A6D3B; margin-top: 8px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #2E5C38; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(46,92,56,0.25); }
    .divider { height: 1px; background: #EFE8DA; margin: 28px 0; }
    .footer { background: #FAF8F5; padding: 24px; text-align: center; font-size: 11px; color: #8C7B6B; border-top: 1px solid #EFE8DA; }
    .warning { font-size: 12px; color: #A0522D; background: #FFF5EE; border-left: 4px solid #A0522D; padding: 10px 14px; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ENMAR ORGANIC FOOD</h1>
      <p>Pure & Natural Agro Products from Bangladesh</p>
    </div>
    <div class="content">
      <div class="greeting">Assalamu Alaikum, ${user.name || "Valued Customer"}!</div>
      <p>We received a request to reset the password for your ENMAR account linked to <strong>${cleanEmail}</strong>.</p>
      
      <p>You can verify and reset your password using the 6-digit verification code below:</p>

      <div class="otp-card">
        <div class="otp-title">Your 6-Digit Password Reset Code</div>
        <div class="otp-code">${otpCode}</div>
        <div class="otp-validity">⏱️ Valid for 15 minutes only</div>
      </div>

      <p style="text-align: center; font-weight: 600; color: #6D4C28; font-size: 13px;">— OR CLICK THE DIRECT BUTTON BELOW —</p>

      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset My Password Now &rarr;</a>
      </div>

      <div class="warning">
        🔒 <strong>Security Tip:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged and your account is completely safe.
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ENMAR Organic Food BD. All rights reserved.</p>
      <p>Dhaka, Bangladesh | Support Hotline: +880 1614 113082</p>
    </div>
  </div>
</body>
</html>
    `;

    // 6. Send Email via Gmail SMTP
    const emailResult = await sendEmail(
      cleanEmail,
      `🔑 ${otpCode} is your ENMAR Password Reset Code`,
      emailHtml
    );

    if (!emailResult.success && emailResult.error) {
      console.warn("[Forgot Password Email Warning]:", emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "A password reset verification code and direct reset link have been sent to your Gmail inbox.",
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error("[Forgot Password Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
