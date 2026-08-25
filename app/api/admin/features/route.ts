// app/api/admin/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverCache } from "@/lib/serverCache";

const DEFAULT_SYSTEM_FLAGS = [
  {
    key: "require_login_checkout",
    name: "Require Login For Checkout (লগইন বাধ্যতামূলক)",
    description: "When enabled, visitors must log in or register before checking out. When disabled, guest checkout is allowed.",
    category: "checkout",
    isEnabled: true,
  },
  {
    key: "phone_otp_login",
    name: "Phone OTP Login",
    description: "Allow customers to log in using a 6-digit OTP sent to their mobile number.",
    category: "auth",
    isEnabled: true,
  },
  {
    key: "wishlist",
    name: "Wishlist System",
    description: "Allow customers to save favorite items.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "reviews",
    name: "Customer Reviews & Ratings",
    description: "Enable product ratings and review submission.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "customer_ai_widget",
    name: "AI Customer Assistant Widget",
    description: "Floating AI shopping assistant on the storefront.",
    category: "ai",
    isEnabled: true,
  },
  {
    key: "promo_codes",
    name: "Promo / Discount Codes",
    description: "Allow customers to apply coupon codes at checkout.",
    category: "checkout",
    isEnabled: true,
  },
  {
    key: "whatsapp_floating_button",
    name: "Floating WhatsApp Button",
    description: "Show floating WhatsApp support button.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "cookie_consent_banner",
    name: "Cookie Consent Banner",
    description: "Show privacy/cookie banner on bottom.",
    category: "compliance",
    isEnabled: true,
  },
  {
    key: "payment_cod",
    name: "Cash on Delivery (COD)",
    description: "Accept Cash on Delivery payment option at checkout.",
    category: "payments",
    isEnabled: true,
  },
  {
    key: "payment_bkash",
    name: "Online / Mobile Payments (SSLCommerz)",
    description: "Accept bKash, Nagad, Rocket, Cards via SSLCommerz gateway.",
    category: "payments",
    isEnabled: true,
  },
];

export async function GET() {
  try {
    // Ensure all standard system flags exist
    for (const flag of DEFAULT_SYSTEM_FLAGS) {
      await prisma.featureFlag.upsert({
        where: { key: flag.key },
        update: {},
        create: flag,
      });
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: [{ category: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ success: true, flags });
  } catch (error: any) {
    console.error("[Admin Features GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, isEnabled } = body;

    if (!key) {
      return NextResponse.json({ error: "Feature key is required" }, { status: 400 });
    }

    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: { isEnabled: Boolean(isEnabled) },
      create: {
        key,
        name: key.replace(/_/g, " "),
        category: "general",
        isEnabled: Boolean(isEnabled),
      },
    });

    serverCache.invalidateTag("features");
    serverCache.invalidateTag("settings");

    return NextResponse.json({
      success: true,
      message: `Feature '${updated.name}' is now ${updated.isEnabled ? "ENABLED" : "DISABLED"}.`,
      flag: updated,
    });
  } catch (error: any) {
    console.error("[Admin Features POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
