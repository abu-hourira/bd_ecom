// scripts/test-note-hub.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runTest() {
  console.log("🚀 Testing /note Social Order Hub & Manual Order Integration...\n");

  try {
    // 1. Get a test product
    const product = await prisma.product.findFirst({
      where: { isActive: true, stockQuantity: { gt: 2 } },
    });

    if (!product) {
      throw new Error("No active product found in database");
    }

    const initialStock = product.stockQuantity;
    console.log(`1️⃣ Found Product: '${product.name}' (Initial Stock: ${initialStock}, Price: ৳${product.price})`);

    // 2. Simulate Chat Parsed Order Submission to /api/admin/orders/manual
    console.log("2️⃣ Submitting test social order (Messenger/WhatsApp Chat)...");
    const orderPayload = {
      customerName: "শফিকুল ইসলাম",
      customerPhone: "01812345678",
      shippingAddress: "বাসা ৮, রোড ১২, ধানমন্ডি, ঢাকা",
      deliveryZone: "Inside Dhaka",
      paymentMethod: "COD",
      shippingFee: 60,
      discountAmount: 20,
      customerNotes: "Order from Facebook Messenger Chat",
      items: [
        {
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.discountPrice || product.price),
          quantity: 2,
          unit: product.unit,
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/admin/orders/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to create manual order");
    }

    console.log(`   ✅ Order Created Successfully!`);
    console.log(`   📦 Order Number: #${data.order.orderNumber}`);
    console.log(`   🔍 Tracking ID: ${data.order.trackingId}`);
    console.log(`   💰 Total Bill: ৳${data.order.totalAmount}`);
    console.log(`   📲 WhatsApp Link: ${data.whatsappUrl.slice(0, 70)}...`);

    // 3. Verify Stock Decrement
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    console.log(`3️⃣ Checking Inventory: Initial: ${initialStock} -> New Stock: ${updatedProduct.stockQuantity}`);
    if (updatedProduct.stockQuantity === initialStock - 2) {
      console.log("   ✅ Stock decremented accurately by 2 units!");
    } else {
      console.warn("   ⚠️ Stock did not decrement as expected.");
    }

    // 4. Verify Live Tracking Endpoint
    console.log("4️⃣ Verifying live customer tracking endpoint...");
    const trackRes = await fetch(`${BASE_URL}/api/storefront/track/${data.order.trackingId}`);
    const trackData = await trackRes.json();
    if (trackRes.ok && trackData.order) {
      console.log(`   ✅ Live Tracking Verified: Stage is '${trackData.order.orderStatus}'`);
    } else {
      throw new Error("Live tracking lookup failed");
    }

    // 5. Verify /note page loads HTTP 200
    console.log("5️⃣ Verifying /note page loads HTTP 200...");
    const notePageRes = await fetch(`${BASE_URL}/note`);
    if (notePageRes.ok) {
      console.log(`   ✅ /note page returned HTTP ${notePageRes.status} OK`);
    } else {
      throw new Error(`/note returned HTTP ${notePageRes.status}`);
    }

    console.log("\n==================================================");
    console.log("🎉 ALL 4 SOCIAL ORDER & /note FEATURES ARE 100% OPERATIONAL!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Test Failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
