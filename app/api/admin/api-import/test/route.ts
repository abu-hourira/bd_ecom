// app/api/admin/api-import/test/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpointUrl, authType, authToken } = body;

    if (!endpointUrl) {
      return NextResponse.json({ error: "Endpoint URL is required." }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": "ENMAR-API-Connector/1.0",
    };

    if (authToken) {
      const type = (authType || "bearer").toLowerCase().replace(/[-_]/g, "");
      if (type === "bearer") {
        headers["Authorization"] = `Bearer ${authToken}`;
      } else if (type === "apikey") {
        headers["x-api-key"] = authToken;
      } else {
        headers["Authorization"] = authToken;
      }
    }

    const externalRes = await fetch(endpointUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!externalRes.ok) {
      return NextResponse.json({
        error: `External API responded with status ${externalRes.status} ${externalRes.statusText}`,
      }, { status: 400 });
    }

    const data = await externalRes.json();
    const sampleItems = Array.isArray(data) ? data.slice(0, 5) : Array.isArray(data.data) ? data.data.slice(0, 5) : Array.isArray(data.products) ? data.products.slice(0, 5) : [data];

    return NextResponse.json({
      success: true,
      rawKeys: sampleItems[0] ? Object.keys(sampleItems[0]) : [],
      sampleItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reach external API" }, { status: 500 });
  }
}
