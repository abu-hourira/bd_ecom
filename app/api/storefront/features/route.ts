// app/api/storefront/features/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cacheKey = "storefront_feature_flags";
    const cached = serverCache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json(
        { success: true, features: cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const flags = await prisma.featureFlag.findMany({
      select: { key: true, isEnabled: true },
    });

    const featureMap: Record<string, boolean> = {};
    flags.forEach((f) => {
      featureMap[f.key] = f.isEnabled;
    });

    serverCache.set(cacheKey, featureMap, 300, ["settings", "features"]);

    return NextResponse.json(
      {
        success: true,
        features: featureMap,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Features Error]:", error);
    return NextResponse.json({
      success: true,
      features: {},
    });
  }
}
