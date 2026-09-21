// app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { triggerSnapshotRebuild } from "@/lib/snapshotEngine";

export async function GET() {
  try {
    const [banners, bannerSetting] = await Promise.all([
      prisma.promotionBanner.findMany({
        orderBy: { displayOrder: "asc" },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "homepage_promo_banner_enabled" },
      }),
    ]);

    const isSectionEnabled = bannerSetting ? bannerSetting.value !== "false" : true;

    return NextResponse.json({
      success: true,
      banners,
      isSectionEnabled,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, headline, subtitle, imageUrl, targetLink, displayOrder, isActive } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and Banner Image are required." }, { status: 400 });
    }

    const banner = await prisma.promotionBanner.create({
      data: {
        title,
        headline: headline || null,
        subtitle: subtitle || null,
        imageUrl,
        targetLink: targetLink || "/products",
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await triggerSnapshotRebuild().catch(() => {});
    try {
      revalidatePath("/", "layout");
      revalidatePath("/products");
    } catch (e) {}

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { isSectionEnabled } = body;

    if (isSectionEnabled === undefined) {
      return NextResponse.json({ error: "isSectionEnabled boolean required." }, { status: 400 });
    }

    const enabledValue = isSectionEnabled ? "true" : "false";

    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: "homepage_promo_banner_enabled" },
        update: { value: enabledValue, group: "promotions" },
        create: { key: "homepage_promo_banner_enabled", value: enabledValue, group: "promotions" },
      }),
      prisma.featureFlag.upsert({
        where: { key: "homepage_promo_banners" },
        update: { isEnabled: Boolean(isSectionEnabled) },
        create: {
          key: "homepage_promo_banners",
          name: "Homepage Promotional Banner Slider",
          description: "Display top promotional ads and banner slider on storefront homepage",
          category: "storefront",
          isEnabled: Boolean(isSectionEnabled),
        },
      }),
    ]);

    await triggerSnapshotRebuild().catch(() => {});
    try {
      revalidatePath("/", "layout");
      revalidatePath("/products");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      isSectionEnabled: Boolean(isSectionEnabled),
      message: isSectionEnabled
        ? "হোমপেজ ব্যানার সেকশন চালু করা হয়েছে।"
        : "হোমপেজ ব্যানার সেকশন সাময়িকভাবে বন্ধ করা হয়েছে।",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
