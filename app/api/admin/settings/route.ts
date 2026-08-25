// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settingsList = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    let theme = await prisma.themeSetting.findFirst();
    if (!theme) {
      theme = await prisma.themeSetting.create({
        data: {
          primaryColor: "#14421a",
          secondaryColor: "#5c3a21",
          accentColor: "#f5a623",
          backgroundColor: "#fdfbf7",
          textColor: "#1f2937",
          fontHeading: "Fraunces",
          fontBody: "Work Sans",
          buttonRadius: "rounded-xl",
          isPublished: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      theme,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { serverCache } from "@/lib/serverCache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, theme } = body;

    // Update site settings
    if (settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), group: "general" },
        });
      }
    }

    // Update theme settings
    if (theme && typeof theme === "object") {
      const existingTheme = await prisma.themeSetting.findFirst();
      if (existingTheme) {
        await prisma.themeSetting.update({
          where: { id: existingTheme.id },
          data: {
            primaryColor: theme.primaryColor || existingTheme.primaryColor,
            secondaryColor: theme.secondaryColor || existingTheme.secondaryColor,
            accentColor: theme.accentColor || existingTheme.accentColor,
            backgroundColor: theme.backgroundColor || existingTheme.backgroundColor,
            textColor: theme.textColor || existingTheme.textColor,
            fontHeading: theme.fontHeading || existingTheme.fontHeading,
            fontBody: theme.fontBody || existingTheme.fontBody,
            buttonRadius: theme.buttonRadius || existingTheme.buttonRadius,
          },
        });
      } else {
        await prisma.themeSetting.create({ data: theme });
      }
    }

    // Invalidate server cache so storefront updates immediately
    serverCache.invalidateTag("settings");
    serverCache.invalidateAll();

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error: any) {
    console.error("[Settings POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
