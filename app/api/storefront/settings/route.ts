// app/api/storefront/settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const CACHE_KEY = "storefront_settings_payload";
    const cached = serverCache.get<any>(CACHE_KEY);
    if (cached) {
      return NextResponse.json(
        { success: true, ...cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
          },
        }
      );
    }

    const [settingsList, theme] = await Promise.all([
      prisma.siteSetting.findMany({
        where: { isSecret: false },
        select: { key: true, value: true },
      }),
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
      freeShippingThreshold: "1500",
      shippingFlat: "100",
      delivery_base_fee: "100",
      delivery_base_weight_kg: "1.0",
      delivery_per_extra_kg: "20",
      delivery_free_shipping_threshold: "1500",
    };

    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const payload = { settings, theme };
    serverCache.set(CACHE_KEY, payload, 300, ["settings", "theme"]);

    return NextResponse.json(
      { success: true, ...payload },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
