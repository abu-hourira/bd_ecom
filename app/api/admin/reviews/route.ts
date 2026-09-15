// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("[Admin Reviews GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, reviewId, isApproved, adminReply } = body;

    if (action === "TOGGLE_APPROVAL" && reviewId) {
      const updated = await prisma.review.update({
        where: { id: Number(reviewId) },
        data: { isApproved: Boolean(isApproved) },
      });
      return NextResponse.json({ success: true, message: `Review ${isApproved ? "Approved" : "Hidden"}`, review: updated });
    }

    if (action === "ADMIN_REPLY" && reviewId) {
      const updated = await prisma.review.update({
        where: { id: Number(reviewId) },
        data: { adminReply: adminReply || null },
      });
      return NextResponse.json({ success: true, message: "Official admin reply posted!", review: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Review ID required" }, { status: 400 });

    await prisma.review.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
