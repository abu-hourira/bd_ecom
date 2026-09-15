// app/api/storefront/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_RECIPES = [
  {
    id: 1,
    title: "খাঁটি মধু ও কালোজিরা তেলের ইমিউনিটি বুস্টার ড্রিংক (Immunity Drink)",
    slug: "honey-kalojira-immunity-drink",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
    category: "herbal_remedy",
    prepTimeMinutes: 5,
    servings: 2,
    difficulty: "Easy",
    healthBenefits: "রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে, সর্দি-কাশি দূর করে, হজমশক্তি বাড়ায় ও রক্ত সঞ্চালন স্বাভাবিক রাখে।",
    instructions: [
      { stepNumber: 1, title: "হালকা গরম পানি নিন", description: "এক গ্লাস কুসুম গরম পানি (৪০°C এর নিচে) প্রস্তুত করুন।" },
      { stepNumber: 2, title: "মধু ও কালোজিরা তেল যোগ করুন", description: "১ চামচ সুন্দরবনের প্রাকৃতিক মধু ও ১/২ চামচ কোল্ড প্রেসড কালোজিরা তেল ভালোভাবে মিশিয়ে নিন।" },
      { stepNumber: 3, title: "লেবুর রস যোগ করে সেবন করুন", description: "কয়েক ফোঁটা লেবুর রস মিশিয়ে সকালে খালি পেটে পান করুন।" },
    ],
    linkedProductIds: [1, 2],
    bundleDiscountPercent: 8,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 2,
    title: "খাঁটি ঘিয়ে ভাজা স্পেশাল কাশ্মীরি পোলাও (Deshi Ghee Polao)",
    slug: "deshi-ghee-shahi-polao",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    category: "healthy_cooking",
    prepTimeMinutes: 25,
    servings: 4,
    difficulty: "Medium",
    healthBenefits: "গাওয়া ঘিতে রয়েছে ভিটামিন এ, ডি, ই এবং কে যা হাড় ও জয়েন্ট সুস্থ রাখে এবং দারুণ সুবাস জোগায়।",
    instructions: [
      { stepNumber: 1, title: "চাল ধুয়ে পানি ঝরিয়ে নিন", description: "প্রিমিয়াম চিনিগুঁড়া বা বাসমতী চাল ভালো করে ধুয়ে ২০ মিনিট ভিজিয়ে রাখুন।" },
      { stepNumber: 2, title: "ঘিতে গরম মশলা ও বাদাম ভাজুন", description: "পাত্রে ৩ চামচ এনামার খাঁটি গাওয়া ঘি গরম করে এলাচ, দারুচিনি, তেজপাতা, কাজু ও কিশমিশ ভেজে নিন।" },
      { stepNumber: 3, title: "চাল কষিয়ে দমে রাখুন", description: "চাল দিয়ে হালকা ভেজে ফুটন্ত পানি ও সামান্য লবণ দিয়ে ঢেকে দমে রাখুন ১৫ মিনিট।" },
    ],
    linkedProductIds: [3, 4],
    bundleDiscountPercent: 10,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 3,
    title: "কাঠের ঘানির খাঁটি সরিষার তেলে ইলিশের পাতুরি (Mustard Oil Ilish)",
    slug: "mustard-oil-ilish-paturi",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80",
    category: "healthy_cooking",
    prepTimeMinutes: 30,
    servings: 4,
    difficulty: "Medium",
    healthBenefits: "কোল্ড প্রেসড সরিষার তেলের ওমেগা-৩ ফ্যাটি এসিড কোলেস্টেরল কমায় এবং হার্টকে সুরক্ষা দেয়।",
    instructions: [
      { stepNumber: 1, title: "সরিষা ও কাঁচামরিচ বাটা তৈরি", description: "সাদা ও কালো সরিষা সাথে কাঁচামরিচ ও লবণ দিয়ে মসৃণ পেস্ট বানিয়ে নিন।" },
      { stepNumber: 2, title: "তেল দিয়ে মাখানো", description: "ইলিশ মাছে সরিষা বাটা, হলুদ ও ৩ টেবিল চামচ খাঁটি ঝাঁজালো সরিষার তেল ভালো করে মেখে কলাপাতায় মুড়িয়ে নিন।" },
      { stepNumber: 3, title: "ধিম আঁচে শেঁকা", description: "তাওয়ায় কলাপাতা মুড়ানো মাছ ধিম আঁচে উভয় পাশ ১০ মিনিট করে সেদ্ধ করুন।" },
    ],
    linkedProductIds: [1, 5],
    bundleDiscountPercent: 5,
    isFeatured: true,
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = { isActive: true };
    if (category && category !== "all") {
      where.category = category;
    }

    let recipes = await prisma.recipe.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { id: "desc" }],
    });

    if (recipes.length === 0 && !category) {
      // Seed default recipes
      for (const r of DEFAULT_RECIPES) {
        await prisma.recipe.upsert({
          where: { slug: r.slug },
          update: {},
          create: {
            title: r.title,
            slug: r.slug,
            imageUrl: r.imageUrl,
            category: r.category,
            prepTimeMinutes: r.prepTimeMinutes,
            servings: r.servings,
            difficulty: r.difficulty,
            healthBenefits: r.healthBenefits,
            instructions: r.instructions,
            linkedProductIds: r.linkedProductIds,
            bundleDiscountPercent: r.bundleDiscountPercent,
            isFeatured: r.isFeatured,
            isActive: true,
          },
        });
      }
      recipes = await prisma.recipe.findMany({ where: { isActive: true } });
    }

    return NextResponse.json({
      success: true,
      recipes: recipes.length > 0 ? recipes : DEFAULT_RECIPES,
    });
  } catch (error: any) {
    console.warn("[Recipes GET Error, fallback]:", error);
    return NextResponse.json({ success: true, recipes: DEFAULT_RECIPES });
  }
}
