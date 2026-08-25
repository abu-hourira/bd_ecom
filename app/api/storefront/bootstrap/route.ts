// app/api/storefront/bootstrap/route.ts - Unified Storefront Metadata & Settings Endpoint
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const revalidate = 60; // 60s Edge ISR cache

export async function GET() {
  try {
    const cacheKey = "storefront_bootstrap_bundle";
    const cached = serverCache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json(
        { success: true, ...cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
          },
        }
      );
    }

    const [settingsList, categories, flags] = await Promise.all([
      prisma.siteSetting.findMany({
        where: { isSecret: false },
        select: { key: true, value: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          image: true,
          displayOrder: true,
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.featureFlag.findMany({
        select: { key: true, isEnabled: true },
      }),
    ]);

    const settings: Record<string, string> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const features: Record<string, boolean> = {
      wishlist: true,
      reviews: true,
      customer_ai_widget: true,
      promo_codes: true,
      wellness_tools: true,
      new_product_notifications: true,
      payment_cod: true,
      payment_bkash: true,
      payment_card: true,
      homepage_testimonials: true,
      homepage_combos_banner: true,
      whatsapp_floating_button: true,
      cookie_consent_banner: true,
      search_autocomplete: true,
    };
    flags.forEach((f) => {
      features[f.key] = f.isEnabled;
    });

    const payload = {
      settings,
      categories,
      features,
    };

    serverCache.set(cacheKey, payload, 120, ["settings", "categories", "features"]);

    return NextResponse.json(
      { success: true, ...payload },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (e: any) {
    console.error("[Storefront Bootstrap Error]:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
