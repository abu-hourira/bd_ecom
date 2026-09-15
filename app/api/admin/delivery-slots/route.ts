// app/api/admin/delivery-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "delivery_slots_config" },
    });

    return NextResponse.json({
      success: true,
      config: setting?.value ? JSON.parse(setting.value) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slots } = body;

    await prisma.siteSetting.upsert({
      where: { key: "delivery_slots_config" },
      update: { value: JSON.stringify(slots), group: "delivery" },
      create: { key: "delivery_slots_config", value: JSON.stringify(slots), group: "delivery" },
    });

    return NextResponse.json({ success: true, message: "Delivery slots updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
