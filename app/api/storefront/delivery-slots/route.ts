// app/api/storefront/delivery-slots/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_SLOTS = [
  {
    id: "morning",
    label: "সকাল (Morning Slot)",
    timeRange: "08:00 AM - 12:00 PM",
    express: false,
    extraFee: 0,
    badge: "সবচেয়ে জনপ্রিয়",
  },
  {
    id: "afternoon",
    label: "বিকাল/সন্ধ্যা (Evening Slot)",
    timeRange: "04:00 PM - 08:00 PM",
    express: false,
    extraFee: 0,
    badge: "অফিস ফেরত ডেলিভারি",
  },
  {
    id: "express_dhaka",
    label: "সুপার এক্সপ্রেস ডেলিভারি (Same-Day / 4 Hours)",
    timeRange: "৪ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি (শুধু ঢাকা)",
    express: true,
    extraFee: 50,
    badge: "⚡ সুপার ফাস্ট",
  },
];

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "delivery_slots_config" },
    });

    let slots = DEFAULT_SLOTS;
    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          slots = parsed;
        }
      } catch (e) {}
    }

    // Generate upcoming 4 delivery dates in Bengali & English
    const availableDates = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (i === 0 ? 0 : i)); // Today, Tomorrow, Day+2, Day+3
      
      const dayName = i === 0 ? "আজ (Today)" : i === 1 ? "আগামীকাল (Tomorrow)" : d.toLocaleDateString("bn-BD", { weekday: "long" });
      const formattedDate = d.toLocaleDateString("bn-BD", { day: "numeric", month: "long" });
      const isoDate = d.toISOString().split("T")[0];

      availableDates.push({
        isoDate,
        dayName,
        formattedDate,
        isToday: i === 0,
      });
    }

    return NextResponse.json({
      success: true,
      slots,
      availableDates,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      slots: DEFAULT_SLOTS,
      availableDates: [],
    });
  }
}
