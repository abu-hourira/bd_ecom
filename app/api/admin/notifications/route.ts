// app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

export async function GET() {
  try {
    const [gateways, logs] = await Promise.all([
      prisma.notificationGateway.findMany(),
      prisma.notificationLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    // Decrypt credentials safely and mask sensitive fields
    const sanitizedGateways = gateways.map((g) => {
      let creds: any = {};
      try {
        if (g.credentialsEncrypted) {
          const decrypted = decrypt(g.credentialsEncrypted);
          creds = JSON.parse(decrypted || "{}");
        }
      } catch (e) {
        console.error("Error parsing credentials:", e);
      }

      return {
        id: g.id,
        channel: g.channel,
        provider: g.provider,
        senderId: g.senderId,
        isActive: g.isActive,
        apiKey: creds.apiKey ? "••••••••••••" : "",
        apiEndpoint: creds.apiEndpoint || "",
        smtpHost: creds.smtpHost || "smtp.gmail.com",
        smtpPort: creds.smtpPort || "587",
        smtpUser: creds.smtpUser || "",
        smtpPass: creds.smtpPass ? "••••••••••••" : "",
      };
    });

    return NextResponse.json({
      success: true,
      gateways: sanitizedGateways,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channel, // "SMS" | "EMAIL"
      provider,
      apiKey,
      senderId,
      apiEndpoint,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      isActive = true,
    } = body;

    if (!channel || !provider) {
      return NextResponse.json({ error: "Channel and Provider are required" }, { status: 400 });
    }

    const existing = await prisma.notificationGateway.findFirst({
      where: { channel },
    });

    let existingCreds: any = {};
    if (existing?.credentialsEncrypted) {
      try {
        const decrypted = decrypt(existing.credentialsEncrypted);
        existingCreds = JSON.parse(decrypted || "{}");
      } catch (e) {
        console.error(e);
      }
    }

    const newCreds: any = { ...existingCreds };
    if (apiKey !== undefined && apiKey !== "••••••••••••") newCreds.apiKey = apiKey;
    if (apiEndpoint !== undefined) newCreds.apiEndpoint = apiEndpoint;
    if (smtpHost !== undefined) newCreds.smtpHost = smtpHost;
    if (smtpPort !== undefined) newCreds.smtpPort = smtpPort;
    if (smtpUser !== undefined) newCreds.smtpUser = smtpUser;
    if (smtpPass !== undefined && smtpPass !== "••••••••••••") newCreds.smtpPass = smtpPass;

    const credentialsEncrypted = encrypt(JSON.stringify(newCreds));

    let saved;
    if (existing) {
      saved = await prisma.notificationGateway.update({
        where: { id: existing.id },
        data: {
          provider,
          senderId: senderId || null,
          isActive,
          credentialsEncrypted,
        },
      });
    } else {
      saved = await prisma.notificationGateway.create({
        data: {
          channel,
          provider,
          senderId: senderId || null,
          isActive,
          credentialsEncrypted,
        },
      });
    }

    return NextResponse.json({ success: true, gateway: saved });
  } catch (error: any) {
    console.error("[Save Notification Gateway Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
