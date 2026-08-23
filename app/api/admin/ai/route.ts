// app/api/admin/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptAES, decryptAES } from "@/lib/crypto";

export async function GET() {
  try {
    const setting = await prisma.aISetting.findFirst({
      orderBy: { id: "desc" },
    });

    if (!setting) {
      return NextResponse.json({
        success: true,
        setting: {
          provider: "openai",
          modelName: "gpt-4o",
          systemPrompt: "You are the helpful, polite customer support assistant for ENMAR Organic Food in Bangladesh. Only assist with organic product questions, ingredients, and order tracking.",
          adminPrompt: "You are the internal operations assistant for ENMAR store admins. Help draft product copy, analyze sales velocity, and write marketing slogans.",
          isActive: false,
          hasApiKey: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      setting: {
        id: setting.id,
        provider: setting.provider,
        modelName: setting.modelName,
        systemPrompt: setting.systemPrompt,
        adminPrompt: setting.adminPrompt,
        isActive: setting.isActive,
        rateLimitPerMin: setting.rateLimitPerMin,
        hasApiKey: Boolean(setting.apiKeyEncrypted),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, modelName, systemPrompt, adminPrompt, isActive } = body;

    let encryptedKey: string | undefined = undefined;
    if (apiKey && apiKey.trim()) {
      encryptedKey = encryptAES(apiKey.trim());
    }

    const existing = await prisma.aISetting.findFirst({ orderBy: { id: "desc" } });

    let updated;
    if (existing) {
      updated = await prisma.aISetting.update({
        where: { id: existing.id },
        data: {
          provider: provider || existing.provider,
          apiKeyEncrypted: encryptedKey !== undefined ? encryptedKey : existing.apiKeyEncrypted,
          modelName: modelName || existing.modelName,
          systemPrompt: systemPrompt || existing.systemPrompt,
          adminPrompt: adminPrompt || existing.adminPrompt,
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        },
      });
    } else {
      updated = await prisma.aISetting.create({
        data: {
          provider: provider || "openai",
          apiKeyEncrypted: encryptedKey || "",
          modelName: modelName || "gpt-4o",
          systemPrompt: systemPrompt || "You are ENMAR's customer assistant.",
          adminPrompt: adminPrompt || "You are ENMAR's admin assistant.",
          isActive: Boolean(isActive),
        },
      });
    }

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
