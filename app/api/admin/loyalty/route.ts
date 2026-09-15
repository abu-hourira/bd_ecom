// app/api/admin/loyalty/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [wallets, settings] = await Promise.all([
      prisma.loyaltyWallet.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          transactions: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { coinsBalance: "desc" },
        take: 50,
      }),
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              "loyalty_earn_rate",
              "loyalty_redeem_value",
              "loyalty_min_redeem",
              "loyalty_welcome_bonus",
              "loyalty_is_active",
            ],
          },
        },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      wallets,
      settings: {
        earnRate: settingsMap["loyalty_earn_rate"] || "1", // 1 coin per ৳10
        redeemValue: settingsMap["loyalty_redeem_value"] || "1", // 1 coin = ৳1
        minRedeem: settingsMap["loyalty_min_redeem"] || "50",
        welcomeBonus: settingsMap["loyalty_welcome_bonus"] || "50",
        isActive: settingsMap["loyalty_is_active"] !== "false",
      },
    });
  } catch (error: any) {
    console.error("[Admin Loyalty GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, amount, description, settings } = body;

    if (action === "UPDATE_SETTINGS" && settings) {
      const entries = [
        { key: "loyalty_earn_rate", value: String(settings.earnRate || "1") },
        { key: "loyalty_redeem_value", value: String(settings.redeemValue || "1") },
        { key: "loyalty_min_redeem", value: String(settings.minRedeem || "50") },
        { key: "loyalty_welcome_bonus", value: String(settings.welcomeBonus || "50") },
        { key: "loyalty_is_active", value: String(settings.isActive ?? true) },
      ];

      for (const entry of entries) {
        await prisma.siteSetting.upsert({
          where: { key: entry.key },
          update: { value: entry.value, group: "loyalty" },
          create: { key: entry.key, value: entry.value, group: "loyalty" },
        });
      }

      return NextResponse.json({ success: true, message: "Loyalty configuration saved successfully!" });
    }

    if (action === "ADJUST_COINS" && userId && amount) {
      const adjustment = parseInt(amount, 10);
      let wallet = await prisma.loyaltyWallet.findUnique({ where: { userId: Number(userId) } });

      if (!wallet) {
        wallet = await prisma.loyaltyWallet.create({
          data: {
            userId: Number(userId),
            coinsBalance: Math.max(0, adjustment),
            totalEarned: Math.max(0, adjustment),
          },
        });
      } else {
        const nextBalance = Math.max(0, wallet.coinsBalance + adjustment);
        wallet = await prisma.loyaltyWallet.update({
          where: { id: wallet.id },
          data: {
            coinsBalance: nextBalance,
            totalEarned: adjustment > 0 ? wallet.totalEarned + adjustment : wallet.totalEarned,
            totalSpent: adjustment < 0 ? wallet.totalSpent + Math.abs(adjustment) : wallet.totalSpent,
          },
        });
      }

      await prisma.loyaltyTransaction.create({
        data: {
          walletId: wallet.id,
          amount: adjustment,
          type: "ADMIN_ADJUSTMENT",
          description: description || `Admin adjustment of ${adjustment > 0 ? "+" : ""}${adjustment} Coins`,
        },
      });

      return NextResponse.json({ success: true, message: "User coin balance updated successfully!", wallet });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[Admin Loyalty POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
