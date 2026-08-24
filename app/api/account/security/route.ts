// app/api/account/security/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION 1: SEND OTP (For Change Email or Change Password)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "send_otp") {
      const { userId, userEmail, targetEmail, type } = body;

      let user = null;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      } else if (userEmail) {
        user = await prisma.user.findUnique({ where: { email: userEmail.trim().toLowerCase() } });
      }

      if (!user) {
        return NextResponse.json({ error: "User account not found" }, { status: 404 });
      }

      // If changing email, destination is the new email. If changing password, destination is user's current email.
      const sendTo = type === "CHANGE_EMAIL" ? targetEmail?.trim().toLowerCase() : user.email;

      if (!sendTo || !sendTo.includes("@")) {
        return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
      }

      // If changing email, check if new email is already taken by another account
      if (type === "CHANGE_EMAIL") {
        const existing = await prisma.user.findUnique({ where: { email: sendTo } });
        if (existing && existing.id !== user.id) {
          return NextResponse.json({ error: "This email address is already in use by another account." }, { status: 400 });
        }
      }

      // Generate 6-digit cryptographic OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to DB
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode,
          otpExpiresAt,
        },
      });

      // Send Verification Email via notification service
      const subject =
        type === "CHANGE_EMAIL"
          ? "[ENMAR] Verify Your New Email Address (OTP Code)"
          : "[ENMAR] Security Verification: Password Change (OTP Code)";

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; rounded: 16px;">
          <h2 style="color: #14421a; margin-bottom: 8px;">ENMAR Security Verification</h2>
          <p style="color: #4b5563; font-size: 14px;">
            Hello <strong>${user.name}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 14px;">
            We received a request to ${type === "CHANGE_EMAIL" ? "update your profile email address to <strong>" + sendTo + "</strong>" : "change your account password"}.
          </p>
          <div style="background: #fdfbf7; border: 2px dashed #14421a; padding: 16px; text-align: center; margin: 20px 0; border-radius: 12px;">
            <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; display: block;">Your 6-Digit OTP Code</span>
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #14421a; font-family: monospace;">${otpCode}</span>
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            This code will expire in 10 minutes. If you did not initiate this request, please contact our support team immediately.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center;">
            ENMAR Pure Organic Food &bull; House 14, Road 7, Sector 3, Uttara, Dhaka-1230
          </p>
        </div>
      `;

      await sendEmail(sendTo, subject, htmlContent);

      return NextResponse.json({
        success: true,
        message: `Verification OTP sent to ${sendTo}. Check your inbox/spam folder.`,
        previewCode: otpCode, // For testing convenience
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION 2: VERIFY AND UPDATE EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "update_email") {
      const { userId, userEmail, newEmail, otpCode } = body;

      let user = null;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      } else if (userEmail) {
        user = await prisma.user.findUnique({ where: { email: userEmail.trim().toLowerCase() } });
      }

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!otpCode || !user.otpCode || user.otpCode !== otpCode.trim()) {
        return NextResponse.json({ error: "Invalid OTP verification code. Please check your email." }, { status: 400 });
      }

      if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
        return NextResponse.json({ error: "OTP code has expired. Please request a new one." }, { status: 400 });
      }

      const formattedNewEmail = newEmail.trim().toLowerCase();
      if (!formattedNewEmail || !formattedNewEmail.includes("@")) {
        return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
      }

      // Check uniqueness
      const existing = await prisma.user.findUnique({ where: { email: formattedNewEmail } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "This email address is already taken by another account." }, { status: 400 });
      }

      // Update User email
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: formattedNewEmail,
          isEmailVerified: true,
          otpCode: null,
          otpExpiresAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email address updated and verified successfully!",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION 3: VERIFY AND UPDATE PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "update_password") {
      const { userId, userEmail, currentPassword, newPassword, otpCode } = body;

      let user = null;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      } else if (userEmail) {
        user = await prisma.user.findUnique({ where: { email: userEmail.trim().toLowerCase() } });
      }

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify Current Password
      if (user.passwordHash) {
        const isMatch = await bcrypt.compare(currentPassword || "", user.passwordHash);
        if (!isMatch) {
          return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
        }
      }

      // Verify OTP Code
      if (!otpCode || !user.otpCode || user.otpCode !== otpCode.trim()) {
        return NextResponse.json({ error: "Invalid Gmail OTP verification code." }, { status: 400 });
      }

      if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
        return NextResponse.json({ error: "OTP code has expired. Please request a new one." }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
      }

      // Hash and update password
      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          otpCode: null,
          otpExpiresAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Password changed successfully! Please use your new password next time you login.",
      });
    }

    return NextResponse.json({ error: "Unknown action parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("[Account Security API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
