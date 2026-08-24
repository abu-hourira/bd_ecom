// app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.promotionBanner.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, headline, subtitle, imageUrl, targetLink, displayOrder, isActive } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and Banner Image are required." }, { status: 400 });
    }

    const banner = await prisma.promotionBanner.create({
      data: {
        title,
        headline: headline || null,
        subtitle: subtitle || null,
        imageUrl,
        targetLink: targetLink || "/products",
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
