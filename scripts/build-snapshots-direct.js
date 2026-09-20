// scripts/build-snapshots-direct.js
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const SNAPSHOT_DIR = path.join(process.cwd(), "data", "snapshots");

function getSafeImageUrl(url, fallback = "/placeholder.png") {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "/assets/products/placeholder.jpg") return fallback;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
        return getSafeImageUrl(parsed[0], fallback);
      }
    } catch (e) {}
    return fallback;
  }
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  if (trimmed.startsWith("\\uploads\\")) return trimmed.replace(/\\/g, "/");
  return trimmed;
}

function getProductImages(rawImages, fallback = "/placeholder.png") {
  if (!rawImages) return [fallback];
  if (Array.isArray(rawImages)) {
    const list = rawImages
      .filter((img) => typeof img === "string" && img.trim().length > 0)
      .map((img) => getSafeImageUrl(img, fallback));
    return list.length > 0 ? list : [fallback];
  }
  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const list = parsed
            .filter((img) => typeof img === "string" && img.trim().length > 0)
            .map((img) => getSafeImageUrl(img, fallback));
          return list.length > 0 ? list : [fallback];
        }
      } catch (e) {}
    }
    return [getSafeImageUrl(trimmed, fallback)];
  }
  return [fallback];
}

async function main() {
  console.log("⚡ Fetching active database catalog from TiDB Cloud...");
  const [categories, allProducts, siteSettings, theme, banners, featureFlags] =
    await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          image: true,
          displayOrder: true,
          _count: { select: { products: true } },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.siteSetting.findMany({
        where: { isSecret: false },
        select: { key: true, value: true },
      }),
      prisma.themeSetting.findFirst(),
      prisma.promotionBanner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.featureFlag.findMany({
        select: { key: true, isEnabled: true },
      }),
    ]);

  const settingsMap = {};
  siteSettings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const featuresMap = {
    wishlist: true,
    reviews: true,
    promo_codes: true,
    payment_cod: true,
    payment_bkash: true,
    homepage_promo_banners: true,
    whatsapp_floating_button: true,
  };
  featureFlags.forEach((f) => {
    featuresMap[f.key] = f.isEnabled;
  });

  // Sanitize all products so images is always a clean array of URLs
  const cleanProducts = allProducts.map((p) => {
    const imgs = getProductImages(p.images);
    return {
      ...p,
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : null,
      images: imgs.length > 0 ? imgs : ["/placeholder.png"],
    };
  });

  const featuredProducts = cleanProducts.slice(0, 36);
  const comboDeals = cleanProducts.filter((p) => p.isCombo).slice(0, 8);

  const homePayload = {
    categories,
    featuredProducts,
    comboDeals,
    settings: settingsMap,
    theme,
    banners,
  };

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "home.json"),
    JSON.stringify(homePayload, null, 2)
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "products.json"),
    JSON.stringify(cleanProducts, null, 2)
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "categories.json"),
    JSON.stringify(categories, null, 2)
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "settings.json"),
    JSON.stringify({ settings: settingsMap, theme }, null, 2)
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "bootstrap.json"),
    JSON.stringify(
      { settings: settingsMap, categories, features: featuresMap },
      null,
      2
    )
  );
  fs.writeFileSync(
    path.join(process.cwd(), "data", "site-cache.json"),
    JSON.stringify({ ...settingsMap, categories }, null, 2)
  );

  console.log(`✅ Snapshots written successfully!`);
  console.log(`- Categories count: ${categories.length}`);
  console.log(`- Products count: ${cleanProducts.length}`);
  console.log(`- Combo deals count: ${comboDeals.length}`);
}

main()
  .catch((err) => {
    console.error("Snapshot error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
