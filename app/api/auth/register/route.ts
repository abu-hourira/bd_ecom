// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { sendEmail } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Full name, email address, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      if (existingEmail.isEmailVerified) {
        return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 400 });
      } else {
        // If exists but not verified yet, generate new verification code and update password
        const passwordHash = await bcrypt.hash(password.trim(), 10);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.user.update({
          where: { id: existingEmail.id },
          data: {
            name: name.trim(),
            passwordHash,
            phone: phone ? phone.trim() : existingEmail.phone,
            otpCode,
            otpExpiresAt,
          },
        });

        // Send Email Verification Code
        await sendEmail(
          cleanEmail,
          "Verify your ENMAR Organic Food Account",
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #14421a;">Welcome to ENMAR Organic Food</h2>
            <p>Hello ${name.trim()},</p>
            <p>Thank you for creating an account. Please use the 6-digit verification code below to activate your account:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #14421a; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="color: #6b7280; font-size: 12px;">This code is valid for 15 minutes. If you did not create this account, please ignore this email.</p>
          </div>`
        );

        return NextResponse.json({
          success: true,
          requireVerification: true,
          email: cleanEmail,
          message: "Verification code sent to your email.",
          devCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
        });
      }
    }

    if (phone?.trim()) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } });
      if (existingPhone && existingPhone.isPhoneVerified) {
        return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: Role.CUSTOMER,
        isEmailVerified: false,
        isPhoneVerified: false,
        otpCode,
        otpExpiresAt,
      },
    });

    // Send Email Verification Code
    await sendEmail(
      cleanEmail,
      "Verify your ENMAR Organic Food Account",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #14421a;">Welcome to ENMAR Organic Food</h2>
        <p>Hello ${name.trim()},</p>
        <p>Thank you for creating an account. Please use the 6-digit verification code below to activate your account:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #14421a; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #6b7280; font-size: 12px;">This code is valid for 15 minutes. If you did not create this account, please ignore this email.</p>
      </div>`
    );

    return NextResponse.json({
      success: true,
      requireVerification: true,
      email: cleanEmail,
      message: "Verification code sent to your email.",
      devCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error("[Register Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
