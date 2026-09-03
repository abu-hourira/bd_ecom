// app/api/admin/ai/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    const where: any = {};
    if (source && source !== "ALL") {
      where.source = source.toUpperCase();
    }

    const [logs, total] = await Promise.all([
      prisma.aIConversationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          sessionId: true,
          provider: true,
          modelName: true,
          latencyMs: true,
          source: true,
          userMessage: true,
          aiResponse: true,
          tokensUsed: true,
          createdAt: true,
        },
      }),
      prisma.aIConversationLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.aIConversationLog.deleteMany({});
    return NextResponse.json({ success: true, message: "AI logs cleared successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
