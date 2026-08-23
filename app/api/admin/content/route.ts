import { revalidatePath } from "next/cache";
// app/api/admin/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { translations as defaultTranslations } from "@/lib/i18n";

export async function GET() {
  try {
    const dbSettings = await prisma.siteSetting.findMany({
      where: {
        group: { in: ["i18n", "content", "i18n_bn", "i18n_en"] },
      },
    });

    const dbMap: Record<string, string> = {};
    dbSettings.forEach((s) => {
      dbMap[s.key] = s.value;
    });

    // Build unified list of all keys with category/section metadata
    const allKeys = Array.from(
      new Set([
        ...Object.keys(defaultTranslations.bn),
        ...Object.keys(defaultTranslations.en),
      ])
    );

    const items = allKeys.map((key) => {
      const section = key.split(".")[0] || "general";
      const bnKey = `i18n_bn_${key}`;
      const enKey = `i18n_en_${key}`;

      const bnValue = dbMap[bnKey] !== undefined ? dbMap[bnKey] : defaultTranslations.bn[key] || "";
      const enValue = dbMap[enKey] !== undefined ? dbMap[enKey] : defaultTranslations.en[key] || "";

      return {
        key,
        section,
        bnValue,
        enValue,
        isCustomized: dbMap[bnKey] !== undefined || dbMap[enKey] !== undefined,
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("[Admin Content GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body as { items: Array<{ key: string; bnValue: string; enValue: string }> };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    for (const item of items) {
      const bnKey = `i18n_bn_${item.key}`;
      const enKey = `i18n_en_${item.key}`;

      // Upsert Bengali
      await prisma.siteSetting.upsert({
        where: { key: bnKey },
        update: { value: item.bnValue, group: "i18n_bn" },
        create: { key: bnKey, value: item.bnValue, group: "i18n_bn" },
      });

      // Upsert English
      await prisma.siteSetting.upsert({
        where: { key: enKey },
        update: { value: item.enValue, group: "i18n_en" },
        create: { key: enKey, value: item.enValue, group: "i18n_en" },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath("/checkout");
    return NextResponse.json({
      success: true,
      message: `Successfully saved ${items.length} content block(s) to database.`,
    });
  } catch (error: any) {
    console.error("[Admin Content POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
