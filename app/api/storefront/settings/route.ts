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
      brandName: "ENMAR",
      brandTagline: "100% Pure Organic Food",
      contactPhone: "+880 1614 113082",
      contactEmail: "support@enmar.shop",
      contactAddress: "House 14, Road 7, Sector 3, Uttara, Dhaka-1230",
      whatsappNumber: "8801614113082",
      whatsappDefaultMessage: "Hello ENMAR, I would like to know more about your organic products.",
      siteLogo: "",
      siteFavicon: "",
      freeShippingThreshold: "1500",
      shippingFlat: "70",
    };

    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings, theme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
