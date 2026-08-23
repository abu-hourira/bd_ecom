// app/api/admin/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: [{ category: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ success: true, flags });
  } catch (error: any) {
    console.error("[Admin Features GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, isEnabled } = body;

    if (!key) {
      return NextResponse.json({ error: "Feature key is required" }, { status: 400 });
    }

    const updated = await prisma.featureFlag.update({
      where: { key },
      data: { isEnabled: Boolean(isEnabled) },
    });

    return NextResponse.json({
      success: true,
      message: `Feature '${updated.name}' is now ${updated.isEnabled ? "ENABLED" : "DISABLED"}.`,
      flag: updated,
    });
  } catch (error: any) {
    console.error("[Admin Features POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
