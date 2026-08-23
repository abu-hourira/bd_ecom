// app/api/admin/api-keys/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const keys = await prisma.aPIKey.findMany({
      include: {
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const recentLogs = await prisma.aPIAccessLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        apiKey: {
          select: { name: true, keyPrefix: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      keys,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rateLimit, permissions } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Key name is required" }, { status: 400 });
    }

    // Generate random API Key token (e.g. enm_live_xxxx)
    const rawKey = `enm_live_${crypto.randomBytes(24).toString("hex")}`;
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await prisma.aPIKey.create({
      data: {
        name: name.trim(),
        keyPrefix,
        keyHash,
        rateLimit: Number(rateLimit) || 60,
        permissions: permissions || "read:products",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey,
      rawKey, // Returned ONLY ONCE upon creation for admin to copy
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
