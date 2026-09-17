// scripts/test-customer-e2e.mjs - Full Customer Journey Simulation Test
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runCustomerTest() {
  console.log("🛒 [Customer Simulation] Starting End-to-End Customer Flow...\n");
  const results = [];

  // Step 1: Browse Storefront Homepage
  console.log("1️⃣ [Step 1: Homepage & Menu] Checking Homepage & Product API...");
  try {
    const res = await fetch(`${BASE_URL}/api/storefront/home`);
    const data = await res.json();
    if (res.ok && data.featuredProducts?.length > 0) {
      console.log(`   ✅ Homepage API loaded successfully with ${data.featuredProducts.length} featured products and ${data.categories?.length || 0} categories.`);
      results.push({ step: "Homepage API", status: "PASSED" });
    } else {
      throw new Error("Homepage API returned no featured products");
    }
  } catch (err) {
    console.error("   ❌ Homepage API Failed:", err.message);
    results.push({ step: "Homepage API", status: "FAILED", error: err.message });
  }

  // Step 2: Browse Single Product Detail
  console.log("\n2️⃣ [Step 2: Product Detail] Testing 'handmade-whole-wheat-red-flour-frozen-roti-20pcs'...");
  let targetProduct = null;
  try {
    const slug = "handmade-whole-wheat-red-flour-frozen-roti-20pcs";
    const res = await fetch(`${BASE_URL}/api/storefront/products/${slug}`);
    const data = await res.json();
    if (res.ok && data.product) {
      targetProduct = data.product;
      console.log(`   ✅ Product Loaded: "${targetProduct.name}" | Price: ৳${targetProduct.price} | Stock: ${targetProduct.stockQuantity}`);
      results.push({ step: "Product Detail API", status: "PASSED" });
    } else {
      throw new Error(`Failed to load product by slug: ${slug}`);
    }
  } catch (err) {
    console.error("   ❌ Product Detail API Failed:", err.message);
    results.push({ step: "Product Detail API", status: "FAILED", error: err.message });
  }

  // Step 3: Test Quick Order Flow with Order Bump Add-on
  console.log("\n3️⃣ [Step 3: Fast 1-Click Quick Order] Placing an order as 'রফিক আহমেদ'...");
  let placedOrderTrackingId = null;
  try {
    const orderPayload = {
      customerName: "রফিক আহমেদ",
      customerPhone: "01711223344",
      customerAddress: "রোড ৪, ব্লক বি, মিরপুর ১০, ঢাকা",
      deliveryZone: "inside_dhaka",
      paymentMethod: "cod",
      items: [
        {
          productId: targetProduct ? targetProduct.id : 270001,
          quantity: 2,
          unitPrice: targetProduct ? Number(targetProduct.discountPrice || targetProduct.price) : 230,
        },
      ],
      orderBumpAddon: {
        name: "স্পেশাল ঘরোয়া মোমো চাটনি",
        price: 50,
      },
      note: "Customer E2E Test Order",
    };

    const res = await fetch(`${BASE_URL}/api/storefront/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (res.ok && (data.success || data.trackingId || data.order?.trackingId)) {
      placedOrderTrackingId = data.trackingId || data.order?.trackingId;
      console.log(`   ✅ 1-Click Quick Order placed successfully! Tracking ID: ${placedOrderTrackingId}`);
      results.push({ step: "1-Click Quick Order", status: "PASSED", trackingId: placedOrderTrackingId });
    } else {
      throw new Error(data.error || "Order creation failed");
    }
  } catch (err) {
    console.error("   ❌ Quick Order Creation Failed:", err.message);
    results.push({ step: "1-Click Quick Order", status: "FAILED", error: err.message });
  }

  // Step 4: Track Order Status
  if (placedOrderTrackingId) {
    console.log(`\n4️⃣ [Step 4: Live Order Tracking] Fetching tracking status for '${placedOrderTrackingId}'...`);
    try {
      const res = await fetch(`${BASE_URL}/api/storefront/track/${placedOrderTrackingId}`);
      const data = await res.json();
      if (res.ok && data.order) {
        console.log(`   ✅ Order Status: ${data.order.status} | Total Amount: ৳${data.order.totalAmount} | Payment: ${data.order.paymentMethod}`);
        results.push({ step: "Order Tracking API", status: "PASSED" });
      } else {
        throw new Error(data.error || "Tracking lookup failed");
      }
    } catch (err) {
      console.error("   ❌ Order Tracking API Failed:", err.message);
      results.push({ step: "Order Tracking API", status: "FAILED", error: err.message });
    }
  }

  // Step 5: Test All Key Customer Routes for 200 OK
  console.log("\n5️⃣ [Step 5: Storefront Page Health Check] Verifying routes...");
  const routesToTest = [
    "/",
    "/products",
    "/products/handmade-whole-wheat-red-flour-frozen-roti-20pcs",
    "/products/handmade-leaf-shape-chicken-momo-12pcs",
    "/products/crispy-frozen-chicken-spring-rolls-10pcs",
    "/products/homemade-frozen-shingara-kalojira-10pcs",
    "/checkout",
    "/track",
    "/cart",
  ];

  let routesPassed = 0;
  for (const route of routesToTest) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      if (res.ok) {
        console.log(`   ✅ ${route} -> HTTP ${res.status} OK`);
        routesPassed++;
      } else {
        console.warn(`   ⚠️ ${route} -> HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`   ❌ ${route} -> ${e.message}`);
    }
  }
  results.push({ step: "Route Health", status: `${routesPassed}/${routesToTest.length} PASSED` });

  console.log("\n==================================================");
  console.log("🏁 [CUSTOMER JOURNEY SUMMARY]");
  console.log("==================================================");
  console.table(results);
}

runCustomerTest().catch(console.error);
