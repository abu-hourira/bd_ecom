import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settingsList = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "brandName",
            "brandTagline",
            "contactPhone",
            "contactEmail",
            "contactAddress",
            "whatsappNumber",
            "whatsappDefaultMessage",
            "siteLogo",
            "siteFavicon",
            "freeShippingThreshold",
          ],
        },
      },
    });

    const settings: Record<string, string> = {
      brandName: "ENMAR",
      brandTagline: "100% Pure Organic Food",
      contactPhone: "+880 1614 113082",
      contactEmail: "support@enmar.bd",
      contactAddress: "House 14, Road 7, Sector 3, Uttara, Dhaka-1230",
      whatsappNumber: "8801614113082",
      whatsappDefaultMessage: "Hello ENMAR, I would like to know more about your organic products.",
      siteLogo: "/assets/logo/logo.png",
      siteFavicon: "/favicon.ico",
      freeShippingThreshold: "1500",
    };

    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
