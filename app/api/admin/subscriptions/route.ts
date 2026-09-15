// app/api/admin/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [plans, subscribers] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        orderBy: { id: "desc" },
      }),
      prisma.customerSubscription.findMany({
        include: {
          plan: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      plans,
      subscribers,
    });
  } catch (error: any) {
    console.error("[Admin Subscriptions GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, planData, subscriberId, status, nextDeliveryDate } = body;

    if (action === "CREATE_PLAN" || action === "UPDATE_PLAN") {
      const { id, title, slug, description, imageUrl, frequency, discountPercent, price, includedProductIds, isActive } = planData;
      
      const genSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      if (id) {
        const updated = await prisma.subscriptionPlan.update({
          where: { id: Number(id) },
          data: {
            title,
            slug: genSlug,
            description,
            imageUrl,
            frequency,
            discountPercent: Number(discountPercent),
            price: Number(price),
            includedProductIds: includedProductIds || [],
            isActive: isActive !== false,
          },
        });
        return NextResponse.json({ success: true, message: "Subscription plan updated!", plan: updated });
      } else {
        const created = await prisma.subscriptionPlan.create({
          data: {
            title,
            slug: genSlug,
            description: description || "",
            imageUrl: imageUrl || "",
            frequency: frequency || "MONTHLY",
            discountPercent: Number(discountPercent || 10),
            price: Number(price || 1500),
            includedProductIds: includedProductIds || [],
            isActive: true,
          },
        });
        return NextResponse.json({ success: true, message: "Subscription plan created!", plan: created });
      }
    }

    if (action === "UPDATE_SUBSCRIBER_STATUS" && subscriberId) {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (nextDeliveryDate) updateData.nextDeliveryDate = new Date(nextDeliveryDate);

      const updated = await prisma.customerSubscription.update({
        where: { id: Number(subscriberId) },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: `Subscriber updated to ${status}`, subscriber: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[Admin Subscriptions POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
