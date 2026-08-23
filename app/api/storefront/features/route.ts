// app/api/storefront/features/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      select: { key: true, isEnabled: true },
    });

    const featureMap: Record<string, boolean> = {};
    flags.forEach((f) => {
      featureMap[f.key] = f.isEnabled;
    });

    return NextResponse.json({
      success: true,
      features: featureMap,
    });
  } catch (error: any) {
    console.error("[Storefront Features Error]:", error);
    return NextResponse.json({
      success: true,
      features: {},
    });
  }
}
