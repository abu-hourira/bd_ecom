// app/api/admin/api-keys/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const apiKey = await prisma.aPIKey.update({
      where: { id: parseInt(id, 10) },
      data: {
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        name: body.name ? String(body.name) : undefined,
        rateLimit: body.rateLimit ? Number(body.rateLimit) : undefined,
      },
    });

    return NextResponse.json({ success: true, apiKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.aPIKey.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: "API key revoked and deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
