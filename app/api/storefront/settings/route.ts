// app/api/storefront/settings/route.ts
import { NextResponse } from "next/server";
import { getStorefrontSnapshot } from "@/lib/snapshotEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getStorefrontSnapshot<any>("settings");

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
      { success: true, settings: {}, theme: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
