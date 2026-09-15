// app/api/storefront/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/authGuard";

const DEFAULT_PLANS = [
  {
    id: 1,
    title: "মাসিক পরিবার পুষ্টি ও স্বাস্থ্য বক্স (Family Wellness Box)",
    slug: "family-wellness-monthly-box",
    description: "প্রতি মাসের খাটি সরিষার তেল, সুন্দরবনের প্রাকৃতিক মধু, স্পেশাল গাওয়া ঘি এবং প্রিমিয়াম কালোজিরা বীজের সম্পূর্ণ প্যাকেজ।",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    frequency: "MONTHLY",
    discountPercent: 10,
    price: 2450,
    includedProductIds: [1, 2, 3],
    isActive: true,
  },
  {
    id: 2,
    title: "খাটি সরিষার তেল ও মধু প্যাকেজ (Pure Oil & Honey Regular)",
    slug: "pure-oil-honey-regular",
    description: "২ লিটার কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল ও ১ কেজি সুন্দরবনের খলিশা ফুলের মধু — প্রতি ১৫ দিন পর পর হোম ডেলিভারি।",
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=80",
    frequency: "BI_WEEKLY",
    discountPercent: 8,
    price: 1850,
    includedProductIds: [1, 2],
    isActive: true,
  },
  {
    id: 3,
    title: "ডায়াবেটিস ও হার্ট কেয়ার ন্যাচারাল কম্বো (Herbal Care Box)",
    slug: "herbal-care-box",
    description: "কালোজিরা তেল, চিয়া সিডস, ইসবগুলের ভুসি ও অর্গানিক গ্রিন টি এর মাসিক রুটিন প্যাক।",
    imageUrl: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&auto=format&fit=crop&q=80",
    frequency: "MONTHLY",
    discountPercent: 12,
    price: 1650,
    includedProductIds: [3, 4],
    isActive: true,
  },
];

export async function GET() {
  try {
    let plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });

    if (plans.length === 0) {
      // Seed default plans if empty
      for (const p of DEFAULT_PLANS) {
        await prisma.subscriptionPlan.upsert({
          where: { slug: p.slug },
          update: {},
          create: {
            title: p.title,
            slug: p.slug,
            description: p.description,
            imageUrl: p.imageUrl,
            frequency: p.frequency,
            discountPercent: p.discountPercent,
            price: p.price,
            includedProductIds: p.includedProductIds,
            isActive: true,
          },
        });
      }
      plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
      });
    }

    return NextResponse.json({ success: true, plans: plans.length > 0 ? plans : DEFAULT_PLANS });
  } catch (error: any) {
    console.warn("[Subscriptions GET fallback]:", error);
    return NextResponse.json({ success: true, plans: DEFAULT_PLANS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("enmar_token")?.value;
    const auth = token ? await verifyJwtToken(token) : null;

    const body = await req.json();
    const { planId, customerName, customerPhone, shippingAddress, frequency, paymentMethod } = body;

    if (!customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json({ error: "Name, phone, and delivery address are required" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: Number(planId) },
    });

    const total = plan ? Number(plan.price) : 2000;
    const subNum = `SUB-${Math.floor(100000 + Math.random() * 900000)}`;

    const nextDate = new Date();
    if (frequency === "WEEKLY") nextDate.setDate(nextDate.getDate() + 7);
    else if (frequency === "BI_WEEKLY") nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    const subscription = await prisma.customerSubscription.create({
      data: {
        subscriptionNumber: subNum,
        userId: auth?.userId || 1,
        planId: plan ? plan.id : null,
        customerName,
        customerPhone,
        shippingAddress,
        frequency: frequency || plan?.frequency || "MONTHLY",
        nextDeliveryDate: nextDate,
        status: "ACTIVE",
        paymentMethod: paymentMethod || "COD",
        totalPerDelivery: total,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription started successfully! Our team will contact you to confirm the first scheduled delivery.",
      subscription,
    });
  } catch (error: any) {
    console.error("[Create Subscription Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
