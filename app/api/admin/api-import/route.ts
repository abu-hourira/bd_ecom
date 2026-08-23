// app/api/admin/api-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sources = await prisma.aPIImportSource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, endpointUrl, authType, authToken, fieldMapping, syncFrequencyHours, autoPublish } = body;

    if (!name?.trim() || !endpointUrl?.trim()) {
      return NextResponse.json({ error: "Name and Endpoint URL are required." }, { status: 400 });
    }

    const source = await prisma.aPIImportSource.create({
      data: {
        name: name.trim(),
        endpointUrl: endpointUrl.trim(),
        authType: authType || "bearer",
        authTokenEncrypted: authToken ? authToken.trim() : null,
        fieldMapping: fieldMapping || {},
        syncFrequencyHours: Number(syncFrequencyHours) || 12,
        autoPublish: Boolean(autoPublish),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
