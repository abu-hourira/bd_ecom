// app/api/storefront/settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [settingsList, theme] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.themeSetting.findFirst(),
    ]);

    const settings: Record<string, string> = {
      brandName: "",
      brandTagline: "",
      contactPhone: "",
      contactEmail: "",
      contactAddress: "",
      whatsappNumber: "",
      whatsappDefaultMessage: "",
      siteLogo: "",
      siteFavicon: "",
      freeShippingThreshold: "",
      shippingFlat: "",
    };

    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings, theme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
