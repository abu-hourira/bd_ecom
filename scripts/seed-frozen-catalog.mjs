// scripts/seed-frozen-catalog.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("🥟 Starting Frozen Food Catalog Sync...");

  // 1. Update Site Settings for Frozen Foods (Key-Value Store)
  const settings = [
    { key: "brand_name", value: "ENMAR", group: "general" },
    { key: "brand_tagline", value: "ঘরে তৈরি খাঁটি ও স্বাস্থ্যসম্মত ফ্রোজেন খাবার", group: "general" },
    { key: "homepage_hero_headline", value: "ঝটপট গরম গরম ভাজা ও খাওয়ার জন্য সেরা ফ্রোজেন স্ন্যাক্স", group: "content" },
    { key: "homepage_hero_subtext", value: "হাতে তৈরি ফ্রোজেন রুটি, পরোটা, মোমো, সিঙ্গারা, রোল ও পুলি পিঠা — ১০০% হাইজিনিক ও নির্ভেজাল হোমমেড স্বাদ সরাসরি আপনার ফ্রিজে!", group: "content" },
    { key: "contact_address", value: "ঢাকা, বাংলাদেশ", group: "general" },
    { key: "contact_phone", value: "+8801614113082", group: "general" },
    { key: "contact_email", value: "order@enmar.bd", group: "general" },
  ];

  for (const s of settings) {
    let retries = 3;
    while (retries > 0) {
      try {
        await prisma.siteSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, group: s.group },
          create: { key: s.key, value: s.value, group: s.group },
        });
        break;
      } catch (err) {
        retries--;
        console.log(`Retrying setting ${s.key}... (${retries} left)`);
        await new Promise((r) => setTimeout(r, 1500));
        if (retries === 0) throw err;
      }
    }
  }

  // 2. Define Frozen Categories
  const categories = [
    {
      name: "ফ্রোজেন রুটি ও পরোটা",
      slug: "frozen-roti-paratha",
      icon: "bread",
      description: "লাল আটা ও সাদা আটার হাতে তৈরি ফ্রোজেন রুটি — তাওয়ায় দিলেই ফুলে টইটুম্বুর",
      displayOrder: 1,
    },
    {
      name: "ফ্রোজেন মোমো ও ডাম্পলিং",
      slug: "frozen-momos-dumplings",
      icon: "leaf",
      description: "পাতা শেইপ ফ্রোজেন চিকেন মোমো ও ডাম্পলিং — স্টিম অথবা ফ্রাই করার উপযোগী",
      displayOrder: 2,
    },
    {
      name: "ফ্রোজেন রোল ও কাটলেট",
      slug: "frozen-rolls-snacks",
      icon: "snack",
      description: "মুচমুচে ব্রেডক্রাম্ব কোটেড চিকেন স্প্রিং রোল — বিকেলের নাস্তার পারফেক্ট সঙ্গী",
      displayOrder: 3,
    },
    {
      name: "সিঙ্গারা ও সমুচা",
      slug: "frozen-shingara-samosa",
      icon: "triangle",
      description: "কালোজিরা দেওয়া ক্রিস্পি সিঙ্গারা ও মচমচে সমুচা — তেল গরম করে ভেজে নিন",
      displayOrder: 4,
    },
    {
      name: "ঐতিহ্যবাহী পুলি পিঠা",
      slug: "frozen-puli-pitha",
      icon: "pitha",
      description: "ঘরোয়া মসলায় তৈরি ফ্রোজেন ঝাল পুলি পিঠা — ভাজা বা স্টিমের জন্য প্রস্তুত",
      displayOrder: 5,
    },
    {
      name: "ফ্যামিলি কম্বো ও পার্টি বক্স",
      slug: "frozen-combo-packs",
      icon: "bundle",
      description: "রুটি, মোমো, সিঙ্গারা ও রোলের আকর্ষণীয় ডিসকাউন্ট কম্বো প্যাক",
      displayOrder: 6,
    },
  ];

  const catIdMap = {};
  for (const cat of categories) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
    catIdMap[cat.slug] = upserted.id;
  }

  // 3. Products directly using the user's authentic photos
  const products = [
    {
      name: "হাতে তৈরি লাল আটার ফ্রোজেন রুটি (২০ পিস প্যাক)",
      slug: "handmade-whole-wheat-red-flour-frozen-roti-20pcs",
      categorySlug: "frozen-roti-paratha",
      price: 260,
      discountPrice: 230,
      stockQuantity: 45,
      unitQuantity: 20,
      unit: "piece",
      images: [
        "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
        "/uploads/upload-1787287421822-94qjf_1000019651.jpg"
      ],
      shortDescription: "১০০% খাঁটি লাল গমের আটার নরম তুলতুলে ফ্রোজেন রুটি। তাওয়ায় ২ মিনিট সেকলেই গরম ফুলকো রুটি প্রস্তুত।",
      description: "আমাদের এই লাল আটার রুটি সম্পূর্ণ খাঁটি গম ভাঙা আটা দিয়ে তৈরি, যাতে ফাইবার ও পুষ্টিমান অটুট থাকে। কোনো ক্ষতিকর প্রিজারভেটিভ বা কেমিক্যাল ছাড়া হাইজিনিক উপায়ে বেলন-পিরিতে হাতে তৈরি। ফ্রিজ থেকে বের করে বরফ না গলিয়ে সরাসরি গরম তাওয়ায় ৩০-৪০ সেকেন্ড প্রতি পাশ সেকে নিলেই পাবেন একদম তুলতুলে নরম ও ফোলা রুটি। ডায়াবেটিস রোগী ও স্বাস্থ্যসচেতন পরিবারের জন্য শ্রেষ্ঠ পছন্দ।",
      organicCertified: true,
      featured: true,
      weightInGrams: 800,
      deliveryDiscountMinQty: 3,
      deliveryDiscountAmount: 30,
      deliveryDiscountTiers: [
        { minQty: 3, discountAmount: 30 },
        { minQty: 6, discountAmount: 60 }
      ],
    },
    {
      name: "হাতে তৈরি সাদা আটার নরম ফ্রোজেন রুটি (২০ পিস প্যাক)",
      slug: "handmade-white-flour-frozen-roti-20pcs",
      categorySlug: "frozen-roti-paratha",
      price: 240,
      discountPrice: 210,
      stockQuantity: 60,
      unitQuantity: 20,
      unit: "piece",
      images: [
        "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
        "/uploads/upload-1787287421822-94qjf_1000019651.jpg"
      ],
      shortDescription: "পাতলা ও নরম তুলতুলে সাদা আটার ফ্রোজেন রুটি। সকালের নাস্তা বা রাতের ডিনারের জন্য ঝটপট প্রস্তুত।",
      description: "ঘরে তৈরি স্বাদের পাতলা ও নরম সাদা আটার ফ্রোজেন রুটি। আধুনিক ডিপ-ফ্রিজিং প্রযুক্তিতে প্রতিটি রুটি আলাদা ও সতেজ রাখা হয় যাতে একটির সাথে আরেকটি লেগে না যায়। সরাসরি তাওয়ায় সেকে নিয়ে চা, মাংসের ঝোল, ডিম বা ভাজির সাথে পরিবেশন করুন।",
      organicCertified: true,
      featured: true,
      weightInGrams: 750,
      deliveryDiscountMinQty: 3,
      deliveryDiscountAmount: 30,
      deliveryDiscountTiers: [
        { minQty: 3, discountAmount: 30 },
        { minQty: 5, discountAmount: 50 }
      ],
    },
    {
      name: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো (১২ পিস প্যাক)",
      slug: "handmade-leaf-shape-chicken-momo-12pcs",
      categorySlug: "frozen-momos-dumplings",
      price: 320,
      discountPrice: 280,
      stockQuantity: 35,
      unitQuantity: 12,
      unit: "piece",
      images: [
        "/uploads/upload-1787287578589-3cv3w_1000019650.jpg"
      ],
      shortDescription: "সুন্দর পাতার ডিজাইনে হাতে মোড়ানো সুস্বাদু জুসি চিকেন মোমো। সাথে থাকে স্পেশাল চাটনি/সস তৈরির গাইড।",
      description: "দেশি মুরগির কিমা, তাজা পেঁয়াজপাতা, ধনেপাতা, আদা-রসুন ও সিক্রেট হোমমেড মসলার পুরে ঠাসা অনন্য পাতা শেইপের ফ্রোজেন চিকেন মোমো। কোনো কৃত্রিম টেস্টিং সল্ট ছাড়া শতভাগ নিরাপদ ও স্বাস্থ্যকর। রাইস কুকার, স্ট্রিমার বা ফুটন্ত পানির ওপর ৮-১০ মিনিট স্টিম করলেই ভেতরে জুসি ও বাইরে সিল্কি মোমো তৈরি। চাইলে ডুবোতেলে ভেজে ক্রিস্পি ফ্রাইড মোমোও বানাতে পারেন!",
      organicCertified: true,
      featured: true,
      weightInGrams: 400,
      deliveryDiscountMinQty: 2,
      deliveryDiscountAmount: 40,
      deliveryDiscountTiers: [
        { minQty: 2, discountAmount: 40 },
        { minQty: 4, discountAmount: 80 }
      ],
    },
    {
      name: "মুচমুচে ফ্রোজেন চিকেন স্প্রিং রোল (১০ পিস প্যাক)",
      slug: "crispy-frozen-chicken-spring-rolls-10pcs",
      categorySlug: "frozen-rolls-snacks",
      price: 340,
      discountPrice: 299,
      stockQuantity: 40,
      unitQuantity: 10,
      unit: "piece",
      images: [
        "/uploads/upload-1787287687330-fwbvn_1000019648.jpg"
      ],
      shortDescription: "গোল্ডেন ব্রেডক্রাম্ব কোটেড মুচমুচে চিকেন রোল। ডুবোতেলে গোল্ডেন ব্রাউন করে ভাজলেই সেরা নাস্তা।",
      description: "প্রিমিয়াম ব্রেডক্রাম্ব ও তাজা ডিমের প্রলেপে মোড়ানো চিকেন ভেজিটেবল স্প্রিং রোল। ফ্রিজ থেকে বের করে মাঝারি আঁচে গরম তেলে ৫-৬ মিনিট হালকা উল্টেপাল্টে সোনালী করে ভেজে নিন। বাইরে ক্রাঞ্চি ব্রেডক্রাম্ব এবং ভেতরে সুস্বাদু চিকেন পুরের অসাধারণ স্বাদ বড়-ছোট সবার মুখে জল এনে দেবে।",
      organicCertified: true,
      featured: true,
      weightInGrams: 500,
      deliveryDiscountMinQty: 2,
      deliveryDiscountAmount: 30,
      deliveryDiscountTiers: [
        { minQty: 2, discountAmount: 30 },
        { minQty: 4, discountAmount: 70 }
      ],
    },
    {
      name: "হোমমেড ফ্রোজেন সিঙ্গারা (১০ পিস প্যাক)",
      slug: "homemade-frozen-shingara-kalojira-10pcs",
      categorySlug: "frozen-shingara-samosa",
      price: 220,
      discountPrice: 190,
      stockQuantity: 50,
      unitQuantity: 10,
      unit: "piece",
      images: [
        "/uploads/upload-1787287646578-7y92p_1000019649.jpg"
      ],
      shortDescription: "কালোজিরা দেওয়া খাস্তা সিঙ্গারা — খাঁটি আলু, বাদাম ও গরম মসলার পুর দিয়ে তৈরি।",
      description: "ছোটবেলার পাড়ার মোড়ের দোকানের খাস্তা সিঙ্গারার আসল স্বাদ এখন আপনার ফ্রিজে! কালোজিরার সুগন্ধি খামির এবং ভেতরে মশলাদার আলু, চিনাবাদাম ও আদার পুর। হালকা গরম ডুবোতেলে ছেড়ে মৃদু আঁচে ৬-৮ মিনিট ভেজে নিলেই পেয়ে যাবেন সুপার খাস্তা ও মুচমুচে গরম সিঙ্গারা।",
      organicCertified: true,
      featured: true,
      weightInGrams: 450,
      deliveryDiscountMinQty: 3,
      deliveryDiscountAmount: 30,
      deliveryDiscountTiers: [
        { minQty: 3, discountAmount: 30 },
        { minQty: 6, discountAmount: 60 }
      ],
    },
    {
      name: "ঐতিহ্যবাহী ঝাল পুলি পিঠা (১০ পিস প্যাক)",
      slug: "traditional-frozen-spicy-puli-pitha-10pcs",
      categorySlug: "frozen-puli-pitha",
      price: 280,
      discountPrice: 240,
      stockQuantity: 30,
      unitQuantity: 10,
      unit: "piece",
      images: [
        "/uploads/WhatsApp_Image_2026-08-14_at_12_17_00_PM_1787526929366_7lz8b.jpeg",
        "/uploads/WhatsApp_Image_2026-08-14_at_12_17_01_PM__1__1787526933364_nfx26.jpeg"
      ],
      shortDescription: "চালের গুঁড়ার মোড়ানো জিভে জল আনা ঝাল চিকেন ও আলু পুরের স্পেশাল পুলি পিঠা।",
      description: "গ্রাম-বাংলার খাঁটি ঐতিহ্যের স্বাদে তৈরি ঝাল পুলি পিঠা। সুন্দর নকশাদার মোড়কে ভরা সুস্বাদু মাংস ও মসলার পুর। এটি ডুবোতেলে ভেজে অথবা ফুটন্ত পানির ভাপে স্টিম করে — দুইভাবেই অত্যন্ত সুস্বাদুভাবে খাওয়া যায়। চাটনি বা টমেটো সসের সাথে জাস্ট অসাধারণ!",
      organicCertified: true,
      featured: true,
      weightInGrams: 400,
      deliveryDiscountMinQty: 2,
      deliveryDiscountAmount: 30,
      deliveryDiscountTiers: [
        { minQty: 2, discountAmount: 30 },
        { minQty: 4, discountAmount: 70 }
      ],
    },
    {
      name: "ফ্রোজেন ট্রায়াঙ্গেল সমুচা ও স্ন্যাক্স বাইট (১০ পিস)",
      slug: "frozen-triangle-samosa-bites-10pcs",
      categorySlug: "frozen-shingara-samosa",
      price: 240,
      discountPrice: 200,
      stockQuantity: 40,
      unitQuantity: 10,
      unit: "piece",
      images: [
        "/uploads/WhatsApp_Image_2026-08-14_at_12_17_01_PM_1787527594680_in6zn.jpeg",
        "/uploads/WhatsApp_Image_2026-08-14_at_12_17_01_PM__1__1787526933364_nfx26.jpeg"
      ],
      shortDescription: "পাতলা খাস্তা খোসায় মোড়ানো ক্রিস্পি ট্রায়াঙ্গেল সমুচা। বিকেলে মেহমানদারির সেরা নাস্তা।",
      description: "অতিথি আপ্যায়ন কিংবা বিকালের নাস্তায় মাত্র ৫ মিনিটে তৈরি করুন মুচমুচে গরম সমুচা। মশলাদার পুর ও খাস্তা ক্রিস্পি লেয়ার মুখে দিলেই অসাধারণ ক্রাঞ্চ অনুভূতি দেয়।",
      organicCertified: true,
      featured: true,
      weightInGrams: 350,
      deliveryDiscountMinQty: 2,
      deliveryDiscountAmount: 25,
      deliveryDiscountTiers: [
        { minQty: 2, discountAmount: 25 },
        { minQty: 4, discountAmount: 60 }
      ],
    },
    {
      name: "অল-ইন-ওয়ান ফ্রোজেন স্ন্যাক্স ফ্যামিলি মেগা কম্বো",
      slug: "all-in-one-frozen-family-mega-combo-box",
      categorySlug: "frozen-combo-packs",
      price: 1100,
      discountPrice: 890,
      stockQuantity: 25,
      unitQuantity: 1,
      unit: "bundle",
      isCombo: true,
      savingsPercentage: 19,
      images: [
        "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
        "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
        "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
        "/uploads/upload-1787287646578-7y92p_1000019649.jpg"
      ],
      shortDescription: "রুটি (২০ পিস) + মোমো (১২ পিস) + স্প্রিং রোল (১০ পিস) + সিঙ্গারা (১০ পিস) এর মেগা সেভার কম্বো প্যাক!",
      description: "সারা সপ্তাহের সকালের নাস্তা ও বিকালের নাস্তার টেনশন দূর করতে নিয়ে নিন আমাদের অল-ইন-ওয়ান ফ্রোজেন মেগা কম্বো বক্স! থাকছে ২০ পিস নরম রুটি, ১২ পিস জুসি চিকেন মোমো, ১০ পিস ক্রিস্পি চিকেন স্প্রিং রোল এবং ১০ পিস খাস্তা সিঙ্গারা। একসাথে কিনলে পাচ্ছেন বিশাল ২১০ টাকা ছাড় ও ফ্রি ডেলিভারি সুযোগ!",
      organicCertified: true,
      featured: true,
      weightInGrams: 2100,
      deliveryDiscountMinQty: 1,
      deliveryDiscountAmount: 60,
      deliveryDiscountTiers: [
        { minQty: 1, discountAmount: 60 },
        { minQty: 2, discountAmount: 120 }
      ],
    },
  ];

  for (const p of products) {
    const catId = catIdMap[p.categorySlug];
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        categoryId: catId,
        price: p.price,
        discountPrice: p.discountPrice,
        stockQuantity: p.stockQuantity,
        unitQuantity: p.unitQuantity,
        unit: p.unit,
        images: JSON.stringify(p.images),
        shortDescription: p.shortDescription,
        description: p.description,
        organicCertified: p.organicCertified,
        featured: p.featured,
        weightInGrams: p.weightInGrams,
        deliveryDiscountMinQty: p.deliveryDiscountMinQty,
        deliveryDiscountAmount: p.deliveryDiscountAmount,
        deliveryDiscountTiers: p.deliveryDiscountTiers,
        isCombo: p.isCombo || false,
        savingsPercentage: p.savingsPercentage || null,
      },
      create: {
        name: p.name,
        slug: p.slug,
        categoryId: catId,
        price: p.price,
        discountPrice: p.discountPrice,
        stockQuantity: p.stockQuantity,
        unitQuantity: p.unitQuantity,
        unit: p.unit,
        images: JSON.stringify(p.images),
        shortDescription: p.shortDescription,
        description: p.description,
        organicCertified: p.organicCertified,
        featured: p.featured,
        weightInGrams: p.weightInGrams,
        deliveryDiscountMinQty: p.deliveryDiscountMinQty,
        deliveryDiscountAmount: p.deliveryDiscountAmount,
        deliveryDiscountTiers: p.deliveryDiscountTiers,
        isCombo: p.isCombo || false,
        savingsPercentage: p.savingsPercentage || null,
      },
    });
  }

  // 4. Update Promotion Banners
  try {
    const bannerItems = [
      {
        title: "হাতে তৈরি ফ্রোজেন রুটি ও পরোটা",
        headline: "সকাল ও রাতের নাস্তায় ঝটপট সমাধান",
        subtitle: "তাওয়ায় দিলেই ফুলকো নরম তুলতুলে — ১০০% ঘরোয়া স্বাদ",
        imageUrl: "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
        targetLink: "/products?category=frozen-roti-paratha",
        placement: "HERO_CAROUSEL",
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো",
        headline: "ভাপিয়ে নিন মাত্র ৮ মিনিটে",
        subtitle: "জুসি চিকেন ও স্পেশাল ঘরোয়া মসলার পুরে ঠাসা অনন্য মোমো",
        imageUrl: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
        targetLink: "/products?category=frozen-momos-dumplings",
        placement: "HERO_CAROUSEL",
        displayOrder: 2,
        isActive: true,
      },
      {
        title: "মুচমুচে ফ্রোজেন রোল ও খাস্তা সিঙ্গারা",
        headline: "বিকেলের নাস্তায় মুচমুচে ক্রাঞ্চ",
        subtitle: "ডুবোতেলে ভাজলেই রেডি ক্রিস্পি স্প্রিং রোল ও সুস্বাদু সিঙ্গারা",
        imageUrl: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
        targetLink: "/products?category=frozen-rolls-snacks",
        placement: "HERO_CAROUSEL",
        displayOrder: 3,
        isActive: true,
      }
    ];

    await prisma.promotionBanner.deleteMany({
      where: { placement: "HERO_CAROUSEL" }
    });
    for (const b of bannerItems) {
      await prisma.promotionBanner.create({ data: b });
    }
    console.log("✅ Promotion Banners synced!");
  } catch (err) {
    console.log("Note: PromotionBanner sync error:", err?.message);
  }

  console.log("🎉 Frozen Food Catalog Successfully Synced to Database!");
}

run()
  .catch((e) => {
    console.error("Error seeding frozen catalog:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
