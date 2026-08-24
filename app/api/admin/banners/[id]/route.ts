// app/api/admin/banners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = Number(id);
    const body = await req.json();

    const updated = await prisma.promotionBanner.update({
      where: { id: bannerId },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        headline: body.headline !== undefined ? body.headline : undefined,
        subtitle: body.subtitle !== undefined ? body.subtitle : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        targetLink: body.targetLink !== undefined ? body.targetLink : undefined,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, banner: updated });
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
    const bannerId = Number(id);

    await prisma.promotionBanner.delete({ where: { id: bannerId } });
    return NextResponse.json({ success: true, message: "Banner deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
