// app/api/storefront/bootstrap/route.ts - Unified Storefront Metadata & Settings Endpoint
import { NextResponse } from "next/server";
import { getStorefrontSnapshot } from "@/lib/snapshotEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getStorefrontSnapshot<any>("bootstrap");

    if (payload) {
      return NextResponse.json(
        { success: true, ...payload },
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
        settings: {},
        categories: [],
        features: {},
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (e: any) {
    console.error("[Storefront Bootstrap Error]:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
