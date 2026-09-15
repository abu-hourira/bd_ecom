// app/api/loyalty/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("enmar_token")?.value;
    const auth = token ? await verifyJwtToken(token) : null;

    if (!auth || !auth.userId) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        wallet: {
          coinsBalance: 0,
          totalEarned: 0,
          totalSpent: 0,
          tier: "BRONZE",
        },
        transactions: [],
        settings: {
          coinsEarnRate: 1, // 1 coin per ৳10
          coinRedeemValue: 1, // 1 coin = ৳1
          minCoinsToRedeem: 50,
          welcomeBonus: 50,
        },
      });
    }

    let wallet = await prisma.loyaltyWallet.findUnique({
      where: { userId: auth.userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.loyaltyWallet.create({
        data: {
          userId: auth.userId,
          coinsBalance: 50, // Welcome bonus
          totalEarned: 50,
          tier: "SILVER",
          transactions: {
            create: {
              amount: 50,
              type: "SIGNUP_BONUS",
              description: "Welcome to ENMAR Family Bonus Coins",
            },
          },
        },
        include: {
          transactions: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      wallet,
      transactions: wallet.transactions || [],
      settings: {
        coinsEarnRate: 1,
        coinRedeemValue: 1,
        minCoinsToRedeem: 50,
        welcomeBonus: 50,
      },
    });
  } catch (error: any) {
    console.error("[Loyalty Balance GET Error]:", error);
    return NextResponse.json(
      {
        success: true,
        authenticated: false,
        wallet: { coinsBalance: 0, totalEarned: 0, totalSpent: 0, tier: "SILVER" },
        transactions: [],
        settings: { coinsEarnRate: 1, coinRedeemValue: 1, minCoinsToRedeem: 50 },
      },
      { status: 200 }
    );
  }
}
