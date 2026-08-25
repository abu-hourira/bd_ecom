// app/api/admin/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptAES } from "@/lib/crypto";
import { getAiQuotaStatus, resetAiQuotaStatus, resetAiRequestCount } from "@/lib/ai-provider";

export async function GET() {
  try {
    const [setting, quotaStatus] = await Promise.all([
      prisma.aISetting.findFirst({ orderBy: { id: "desc" } }),
      getAiQuotaStatus(),
    ]);

    if (!setting) {
      return NextResponse.json({
        success: true,
        setting: {
          provider: "openai",
          modelName: "gpt-4o",
          systemPrompt: "You are the helpful, polite customer support assistant for ENMAR Organic Food in Bangladesh.",
          adminPrompt: "You are the internal operations assistant for ENMAR store admins.",
          isActive: false,
          hasApiKey: false,
        },
        quotaStatus,
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
      quotaStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider,
      apiKey,
      modelName,
      systemPrompt,
      adminPrompt,
      isActive,
      action,
      monthlyLimit,
      autoResetOnLimit,
    } = body;

    // Action: Reset Quota status (error clearing)
    if (action === "reset_quota") {
      await resetAiQuotaStatus();
      const quotaStatus = await getAiQuotaStatus();
      return NextResponse.json({
        success: true,
        message: "AI Quota status reset successfully. AI Agent is back to active status.",
        quotaStatus,
      });
    }

    // Action: Reset Request Counter to 0
    if (action === "reset_counter") {
      await resetAiRequestCount();
      const quotaStatus = await getAiQuotaStatus();
      return NextResponse.json({
        success: true,
        message: "Monthly AI request counter reset to 0.",
        quotaStatus,
      });
    }

    // Action: Update Monthly Limit
    if (monthlyLimit !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: "ai_monthly_request_limit" },
        update: { value: String(monthlyLimit) },
        create: { key: "ai_monthly_request_limit", value: String(monthlyLimit), group: "ai" },
      });
    }

    // Action: Update Auto-Reset on Limit
    if (autoResetOnLimit !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: "ai_auto_reset_on_limit" },
        update: { value: String(autoResetOnLimit) },
        create: { key: "ai_auto_reset_on_limit", value: String(autoResetOnLimit), group: "ai" },
      });
    }

    let encryptedKey: string | undefined = undefined;
    if (apiKey && apiKey.trim()) {
      encryptedKey = encryptAES(apiKey.trim());
      // When new API key is provided, also reset quota status
      await resetAiQuotaStatus();
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

    const quotaStatus = await getAiQuotaStatus();

    return NextResponse.json({ success: true, setting: updated, quotaStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Delete all AI setting records
    await prisma.aISetting.deleteMany({});

    // Reset quota-related site settings
    const keysToReset = [
      "ai_requests_this_month",
      "ai_quota_exhausted",
      "ai_quota_exhausted_at",
      "ai_rate_limit_hit",
      "ai_rate_limit_hit_at",
    ];

    for (const key of keysToReset) {
      await prisma.siteSetting.deleteMany({ where: { key } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "AI configuration deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
