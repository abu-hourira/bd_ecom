// app/api/admin/promos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const promoId = Number(id);
    const body = await req.json();

    const existing = await prisma.promoCode.findUnique({ where: { id: promoId } });
    if (!existing) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    const updated = await prisma.promoCode.update({
      where: { id: promoId },
      data: {
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        discountValue: body.discountValue !== undefined ? Number(body.discountValue) : existing.discountValue,
        minOrderAmount: body.minOrderAmount !== undefined ? Number(body.minOrderAmount) : existing.minOrderAmount,
        totalUsageCap: body.totalUsageCap !== undefined ? (body.totalUsageCap ? Number(body.totalUsageCap) : null) : existing.totalUsageCap,
      },
    });

    return NextResponse.json({
      success: true,
      promo: updated,
      message: `Promo code "${updated.code}" is now ${updated.isActive ? "ACTIVE" : "DEACTIVATED"}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const promoId = Number(id);

    const existing = await prisma.promoCode.findUnique({ where: { id: promoId } });
    if (!existing) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    await prisma.promoCode.delete({ where: { id: promoId } });

    return NextResponse.json({
      success: true,
      message: `Promo code "${existing.code}" deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
