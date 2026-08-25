// app/api/storefront/i18n/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { translations as defaultTranslations } from "@/lib/i18n";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cacheKey = "storefront_i18n";
    const cached = serverCache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json(
        { success: true, translations: cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const settings = await prisma.siteSetting.findMany({
      where: {
        group: { in: ["i18n", "content", "i18n_bn", "i18n_en"] },
      },
      select: { key: true, value: true },
    });

    const dynamicBn: Record<string, string> = { ...defaultTranslations.bn };
    const dynamicEn: Record<string, string> = { ...defaultTranslations.en };

    settings.forEach((s) => {
      if (s.key.startsWith("i18n_bn_")) {
        const actualKey = s.key.replace("i18n_bn_", "");
        dynamicBn[actualKey] = s.value;
      } else if (s.key.startsWith("i18n_en_")) {
        const actualKey = s.key.replace("i18n_en_", "");
        dynamicEn[actualKey] = s.value;
      }
    });

    const translations = {
      bn: dynamicBn,
      en: dynamicEn,
    };

    serverCache.set(cacheKey, translations, 300, ["settings", "i18n"]);

    return NextResponse.json(
      {
        success: true,
        translations,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront i18n API Error]:", error);
    return NextResponse.json({
      success: true,
      translations: defaultTranslations,
    });
  }
}
