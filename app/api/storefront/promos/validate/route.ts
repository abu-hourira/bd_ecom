// app/api/storefront/promos/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: "Promo code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or expired promo code." }, { status: 404 });
    }

    const orderAmount = Number(subtotal || 0);

    if (promo.minOrderAmount && orderAmount < Number(promo.minOrderAmount)) {
      return NextResponse.json(
        { valid: false, error: `Minimum order amount of ৳${promo.minOrderAmount} required for this code.` },
        { status: 400 }
      );
    }

    if (promo.totalUsageCap && promo.usageCount >= promo.totalUsageCap) {
      return NextResponse.json({ valid: false, error: "Promo code usage limit has been reached." }, { status: 400 });
    }

    let discountAmount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * Number(promo.discountValue)) / 100;
      if (promo.maxDiscountAmount && discountAmount > Number(promo.maxDiscountAmount)) {
        discountAmount = Number(promo.maxDiscountAmount);
      }
    } else if (promo.discountType === "FIXED") {
      discountAmount = Number(promo.discountValue);
    } else if (promo.discountType === "FREE_SHIPPING") {
      discountAmount = 70;
    }

    return NextResponse.json({
      success: true,
      valid: true,
      promoId: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discountAmount: Math.min(discountAmount, orderAmount),
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
