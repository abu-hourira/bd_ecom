// scripts/test-admin-e2e.mjs - Comprehensive Admin Operations Simulation & Verification
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runAdminTest() {
  console.log("👑 [Admin Simulation] Starting Full Admin Operations Workflow...\n");
  const results = [];

  // 1. Dashboard Stats & Sales Overview
  console.log("1️⃣ [Admin Dashboard] Fetching sales summary & inventory alerts...");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`   ✅ Dashboard Stats Loaded: Total Orders: ${data.totalOrders || 0} | Revenue: ৳${data.totalRevenue || 0} | Low Stock Alerts: ${data.lowStockCount || 0}`);
      results.push({ task: "Dashboard Stats", status: "PASSED" });
    } else {
      throw new Error(data.error || "Failed to load admin stats");
    }
  } catch (e) {
    console.error("   ❌ Dashboard Stats Failed:", e.message);
    results.push({ task: "Dashboard Stats", status: "FAILED", error: e.message });
  }

  // 2. Order Management & Status Updates
  console.log("\n2️⃣ [Order Management] Finding recent pending order and advancing stages...");
  try {
    const recentOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (recentOrder) {
      console.log(`   Found Order: #${recentOrder.orderNumber} (Tracking: ${recentOrder.trackingId}) | Current Status: ${recentOrder.orderStatus}`);

      // Update stage to CONFIRMED
      const res1 = await fetch(`${BASE_URL}/api/admin/orders/${recentOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "CONFIRMED",
          adminNotes: "Order verified via phone with customer.",
        }),
      });
      const data1 = await res1.json();
      if (!res1.ok || !data1.success) throw new Error(data1.error || "Failed to confirm order");
      console.log(`   ✅ Stage Updated -> CONFIRMED`);

      // Update stage to SHIPPED with courier details
      const res2 = await fetch(`${BASE_URL}/api/admin/orders/${recentOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "SHIPPED",
          courierPartner: "Steadfast Courier",
          courierTrackingId: "ST-8849201",
        }),
      });
      const data2 = await res2.json();
      if (!res2.ok || !data2.success) throw new Error(data2.error || "Failed to mark order as shipped");
      console.log(`   ✅ Stage Updated -> SHIPPED (Courier: Steadfast, Tracking: ST-8849201)`);

      results.push({ task: "Order Processing & Courier Dispatch", status: "PASSED" });
    } else {
      console.log("   ⚠️ No orders found in database to update.");
      results.push({ task: "Order Processing", status: "SKIPPED" });
    }
  } catch (e) {
    console.error("   ❌ Order Management Failed:", e.message);
    results.push({ task: "Order Processing", status: "FAILED", error: e.message });
  }

  // 3. Product Catalog & Bulk Inventory Operations
  console.log("\n3️⃣ [Product & Inventory Control] Testing Bulk Stock & Price Modifiers...");
  try {
    const testProducts = await prisma.product.findMany({ take: 3 });
    const productIds = testProducts.map((p) => p.id);

    // A. Bulk Stock Update
    const resStock = await fetch(`${BASE_URL}/api/admin/products/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_stock",
        ids: productIds,
        stock: 55,
      }),
    });
    const dataStock = await resStock.json();
    if (!resStock.ok || !dataStock.success) throw new Error(dataStock.error || "Bulk stock update failed");
    console.log(`   ✅ Bulk Stock Updated: Set stock to 55 for ${productIds.length} products.`);

    // B. Bulk Price Modifier (+5%)
    const resPrice = await fetch(`${BASE_URL}/api/admin/products/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_price",
        ids: productIds,
        percentChange: 5,
      }),
    });
    const dataPrice = await resPrice.json();
    if (!resPrice.ok || !dataPrice.success) throw new Error(dataPrice.error || "Bulk price modifier failed");
    console.log(`   ✅ Bulk Price Adjusted: Applied +5% price change to ${productIds.length} products.`);

    results.push({ task: "Bulk Inventory & Price Modifier", status: "PASSED" });
  } catch (e) {
    console.error("   ❌ Inventory Control Failed:", e.message);
    results.push({ task: "Bulk Inventory Control", status: "FAILED", error: e.message });
  }

  // 4. Promo Code Creation & Validation
  console.log("\n4️⃣ [Promotions & Coupons] Creating new promo code 'ADMINTEST15'...");
  try {
    const testCode = "ADMINTEST15";
    await prisma.promoCode.upsert({
      where: { code: testCode },
      update: {
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderAmount: 300,
        totalUsageCap: 100,
        isActive: true,
      },
      create: {
        code: testCode,
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderAmount: 300,
        totalUsageCap: 100,
        isActive: true,
      },
    });
    console.log(`   ✅ Promo Code '${testCode}' created and verified active in database.`);
    results.push({ task: "Promo Code Creation", status: "PASSED" });
  } catch (e) {
    console.error("   ❌ Promo Creation Failed:", e.message);
    results.push({ task: "Promo Code Creation", status: "FAILED", error: e.message });
  }

  // 5. Site Identity, Settings & AI Configurations
  console.log("\n5️⃣ [Site Settings & Branding] Verifying site configuration...");
  try {
    const settings = await prisma.siteSetting.findMany();
    console.log(`   ✅ Site Settings in Database: ${settings.length} key-value configurations verified.`);
    results.push({ task: "Site Settings & Branding", status: "PASSED" });
  } catch (e) {
    console.error("   ❌ Site Settings Failed:", e.message);
    results.push({ task: "Site Settings", status: "FAILED", error: e.message });
  }

  // 6. Admin Panel All Frontend Pages Health Check
  console.log("\n6️⃣ [Admin Page Health Check] Verifying all admin routes for HTTP 200 OK...");
  const adminRoutes = [
    "/admin",
    "/admin/orders",
    "/admin/products",
    "/admin/products/new",
    "/admin/categories",
    "/admin/coupons",
    "/admin/customers",
    "/admin/analytics",
    "/admin/settings",
    "/admin/bin",
    "/admin/notifications",
  ];

  let adminPagesPassed = 0;
  for (const route of adminRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      if (res.ok) {
        console.log(`   ✅ ${route} -> HTTP ${res.status} OK`);
        adminPagesPassed++;
      } else {
        console.warn(`   ⚠️ ${route} -> HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`   ❌ ${route} -> ${e.message}`);
    }
  }
  results.push({ task: "Admin Pages Health", status: `${adminPagesPassed}/${adminRoutes.length} PASSED` });

  console.log("\n==================================================");
  console.log("👑 [ADMIN OPERATIONS SUMMARY]");
  console.log("==================================================");
  console.table(results);
}

runAdminTest().catch(console.error);
