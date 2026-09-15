// app/api/admin/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { triggerSnapshotRebuild } from "@/lib/snapshotEngine";

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
    key: "search_autocomplete",
    name: "Search Autocomplete & Suggestions",
    description: "Live search dropdown preview for customers.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "homepage_combos_banner",
    name: "Homepage Combo & Bundle Section",
    description: "Display family bundle packages on homepage.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "wellness_tools",
    name: "General Wellness Profile & BMI Tools",
    description: "Allow customers to calculate BMI & water intake recommendations.",
    category: "wellness",
    isEnabled: true,
  },
  {
    key: "payment_cod",
    name: "Cash On Delivery (ক্যাশ অন ডেলিভারি)",
    description: "Accept cash payment upon parcel delivery.",
    category: "payment",
    isEnabled: true,
  },
  {
    key: "payment_bkash",
    name: "bKash Direct Gateway",
    description: "Accept bKash mobile payments via SSLCommerz.",
    category: "payment",
    isEnabled: true,
  },
  {
    key: "payment_card",
    name: "Debit / Credit Card Payment",
    description: "Accept Visa, Mastercard, AMEX cards.",
    category: "payment",
    isEnabled: true,
  },
  {
    key: "loyalty_rewards",
    name: "Enmar Coins & Loyalty Rewards (কয়েন ও লয়ালটি রিওয়ার্ড)",
    description: "Customers earn coins on purchases to redeem for instant discounts at checkout.",
    category: "loyalty",
    isEnabled: true,
  },
  {
    key: "subscription_boxes",
    name: "Grocery Subscription Boxes (মাসিক / সাপ্তাহিক গ্রোসারি বক্স)",
    description: "Allow customers to subscribe to automated recurring pantry boxes with savings.",
    category: "subscriptions",
    isEnabled: true,
  },
  {
    key: "recipes_to_cart",
    name: "1-Click Recipes & Remedies to Cart (রেসিপি ও স্বাস্থ্য টিপস থেকে কার্ট)",
    description: "Interactive recipe and herbal remedy pages with 1-click bundle carting.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "scheduled_delivery_slots",
    name: "Scheduled Delivery Time Slots (ডেলিভারি স্লট নির্বাচন)",
    description: "Let customers pick preferred delivery time slots (Morning, Evening, Express) at checkout.",
    category: "checkout",
    isEnabled: true,
  },
  {
    key: "lab_purity_reports",
    name: "Farm-to-Source & Lab Reports (সততা ও ল্যাব টেস্ট রিপোর্ট)",
    description: "Display harvesting district, batch number, and lab purity certificates on product pages.",
    category: "storefront",
    isEnabled: true,
  },
  {
    key: "photo_reviews",
    name: "Customer Photo Reviews & Q&A (ছবিসহ কাস্টমার রিভিউ)",
    description: "Allow customers to upload photos with reviews and view verified photo feedback.",
    category: "storefront",
    isEnabled: true,
  },
];

export async function GET() {
  try {
    const existing = await prisma.featureFlag.findMany();
    const existingKeys = new Set(existing.map((e) => e.key));

    // Ensure any newly defined flags are inserted into DB
    const missing = DEFAULT_SYSTEM_FLAGS.filter((f) => !existingKeys.has(f.key));
    if (missing.length > 0) {
      await Promise.all(
        missing.map((f) =>
          prisma.featureFlag.create({
            data: f,
          })
        )
      );
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

    await triggerSnapshotRebuild().catch(() => {});

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
