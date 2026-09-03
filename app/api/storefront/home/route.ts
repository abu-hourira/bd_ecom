// app/api/storefront/home/route.ts
import { NextResponse } from "next/server";
import { getStorefrontSnapshot } from "@/lib/snapshotEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getStorefrontSnapshot<any>("home");

    if (payload) {
      return NextResponse.json(
        {
          success: true,
          ...payload,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        categories: [],
        featuredProducts: [],
        comboDeals: [],
        settings: {},
        theme: null,
        banners: [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("[Storefront Home API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
