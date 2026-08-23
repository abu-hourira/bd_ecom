// app/api/storefront/i18n/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { translations as defaultTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        group: { in: ["i18n", "content", "i18n_bn", "i18n_en"] },
      },
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

    return NextResponse.json(
      {
        success: true,
        translations: {
          bn: dynamicBn,
          en: dynamicEn,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
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
