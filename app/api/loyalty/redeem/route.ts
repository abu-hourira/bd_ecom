// app/api/loyalty/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/authGuard";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("enmar_token")?.value;
    const auth = token ? await verifyJwtToken(token) : null;

    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Please log in to redeem Enmar Coins" }, { status: 401 });
    }

    const { coinsToRedeem, cartSubtotal } = await req.json();
    const coins = parseInt(coinsToRedeem, 10) || 0;
    const subtotal = parseFloat(cartSubtotal) || 0;

    if (coins <= 0) {
      return NextResponse.json({ error: "Invalid coin amount" }, { status: 400 });
    }

    const wallet = await prisma.loyaltyWallet.findUnique({
      where: { userId: auth.userId },
    });

    if (!wallet || wallet.coinsBalance < coins) {
      return NextResponse.json(
        { error: `Insufficient coin balance. Available: ${wallet?.coinsBalance || 0} Coins` },
        { status: 400 }
      );
    }

    // Minimum redemption threshold
    if (coins < 50 && wallet.coinsBalance >= 50) {
      return NextResponse.json(
        { error: "Minimum 50 coins required for redemption" },
        { status: 400 }
      );
    }

    // Max 50% of cart subtotal can be paid by coins
    const maxDiscount = Math.floor(subtotal * 0.5);
    const calculatedDiscount = Math.min(coins, maxDiscount, subtotal);
    const actualCoinsUsed = calculatedDiscount;

    return NextResponse.json({
      success: true,
      coinsUsed: actualCoinsUsed,
      discountAmount: calculatedDiscount,
      remainingCoins: wallet.coinsBalance - actualCoinsUsed,
      message: `৳${calculatedDiscount} discount applied using ${actualCoinsUsed} Enmar Coins!`,
    });
  } catch (error: any) {
    console.error("[Loyalty Redeem Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to calculate coins discount" }, { status: 500 });
  }
}
