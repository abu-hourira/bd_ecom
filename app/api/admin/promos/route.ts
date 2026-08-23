// app/api/admin/promos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, promos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      totalUsageCap,
      perCustomerLimit,
      startDate,
      endDate,
    } = body;

    if (!code || discountValue === undefined) {
      return NextResponse.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.promoCode.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        discountType: (discountType as DiscountType) || DiscountType.PERCENTAGE,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        totalUsageCap: totalUsageCap ? Number(totalUsageCap) : null,
        perCustomerLimit: perCustomerLimit ? Number(perCustomerLimit) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, promo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
