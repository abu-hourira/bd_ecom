// app/api/storefront/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { callLLM, ChatMessage } from "@/lib/ai-provider";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch AI Configuration and Live Store Settings
    const [aiSetting, siteSettingsList, categoriesList, products, activePromos] = await Promise.all([
      prisma.aISetting.findFirst({
        where: { isActive: true },
        orderBy: { id: "desc" },
      }),
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              "site_name",
              "site_tagline",
              "contact_phone",
              "contact_whatsapp",
              "contact_email",
              "delivery_charge_inside_dhaka",
              "delivery_charge_outside_dhaka",
              "free_delivery_threshold",
              "return_policy",
              "shipping_policy",
              "about_us",
            ],
          },
        },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, description: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: { select: { name: true } },
          price: true,
          discountPrice: true,
          stockQuantity: true,
          unitQuantity: true,
          unit: true,
          shortDescription: true,
          organicCertified: true,
          isCombo: true,
          badge: true,
        } as any,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.promoCode.findMany({
        where: { isActive: true },
        select: { code: true, discountType: true, discountValue: true, minOrderAmount: true },
      }),
    ]);

    // Build key-value map of site settings
    const settingsMap = (siteSettingsList || []).reduce((acc: Record<string, string>, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const siteName = settingsMap.site_name || "ENMAR Organic Food";
    const siteTagline = settingsMap.site_tagline || "100% Pure & Organic Food";
    const contactPhone = settingsMap.contact_phone || settingsMap.contact_whatsapp || "+880 1614 663082";
    const insideDhakaFee = settingsMap.delivery_charge_inside_dhaka || "70";
    const outsideDhakaFee = settingsMap.delivery_charge_outside_dhaka || "130";
    const freeDeliveryMin = settingsMap.free_delivery_threshold || "1500";

    // Format Categories
    const categoriesSummary = categoriesList.length > 0
      ? categoriesList.map((c) => `- ${c.name}${c.description ? ` (${c.description})` : ""}`).join("\n")
      : "General Organic Food Catalog";

    // Format Live Products
    const productCatalogSummary = products.length > 0
      ? (products as any[])
          .map((p: any) => {
            const unitDisplay = p.unitQuantity ? `${Number(p.unitQuantity)} ${p.unit}` : p.unit;
            const priceDisplay = p.discountPrice ? `৳${p.discountPrice} (Regular: ৳${p.price})` : `৳${p.price}`;
            const stockStatus = p.stockQuantity > 0 ? `In Stock (${p.stockQuantity} available)` : "Out of Stock";
            const badge = p.badge ? ` [${p.badge}]` : "";
            const desc = p.shortDescription ? ` - ${p.shortDescription}` : "";
            return `- ${p.name} (${p.category?.name || "General"})${badge}: ${priceDisplay} per ${unitDisplay} | ${stockStatus}${desc}`;
          })
          .join("\n")
      : "No products currently listed in catalog.";

    // Format Active Promos
    const promosSummary = activePromos.length > 0
      ? activePromos
          .map((pr) => `- Code '${pr.code}': ${pr.discountType === "PERCENTAGE" ? `${pr.discountValue}% OFF` : `৳${pr.discountValue} OFF`} (Min Order: ৳${pr.minOrderAmount || 0})`)
          .join("\n")
      : "No active discount codes right now.";

    // 3. Check for Order Tracking Intent in message
    let orderTrackingContext = "";
    const trackingMatch = message.match(/ENM-[A-Z0-9]{5,12}/i) || message.match(/ENM\d{4,10}/i);
    if (trackingMatch) {
      const trackingQuery = trackingMatch[0].toUpperCase();
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ trackingId: trackingQuery }, { orderNumber: trackingQuery }],
        },
        select: {
          trackingId: true,
          orderNumber: true,
          orderStatus: true,
          courierPartner: true,
          courierTrackingId: true,
          totalAmount: true,
          createdAt: true,
        },
      });

      if (order) {
        orderTrackingContext = `\n[Verified Live Order Details for '${trackingQuery}']: Order #${order.orderNumber} (Tracking: ${order.trackingId}) | Status: '${order.orderStatus}' | Total: ৳${order.totalAmount} | Courier: ${order.courierPartner || "ENMAR Logistics"} (Courier Trx: ${order.courierTrackingId || "Pending"}) | Placed on: ${order.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}.`;
      } else {
        orderTrackingContext = `\n[Tracking Search Result for '${trackingQuery}']: No order found in database matching tracking/order ID '${trackingQuery}'.`;
      }
    }

    // 4. Construct System Prompt with Real-time DB Telemetry
    const customInstructions = aiSetting?.systemPrompt?.trim() || "";
    const systemPrompt = `You are the polite, knowledgeable, and fluent AI Shopping Assistant for ${siteName} (${siteTagline}).
${customInstructions ? `ADMIN CUSTOM INSTRUCTIONS:\n${customInstructions}\n` : ""}
LIVE STORE DATABASE & POLICIES (REAL-TIME DATA FROM DATABASE):
- Store Name: ${siteName}
- Delivery Charges: Inside Dhaka: ৳${insideDhakaFee} | Outside Dhaka: ৳${outsideDhakaFee}
- Free Delivery: Automatically applied on orders of ৳${freeDeliveryMin} and above!
- Customer Hotline / WhatsApp: ${contactPhone}
- Payment Methods: Cash on Delivery (COD) & Online Payment (bKash, Nagad, Rocket, Card via SSLCommerz).

AVAILABLE STORE CATEGORIES:
${categoriesSummary}

LIVE PRODUCT CATALOG (${products.length} active products in database):
${productCatalogSummary}

ACTIVE PROMO CODES / OFFERS:
${promosSummary}
${orderTrackingContext}

CRITICAL OPERATIONAL RULES:
1. Always base product availability, exact weight/measurement units, and prices ONLY on the LIVE PRODUCT CATALOG above. If a customer asks about a product, refer to its exact price, weight, and in-stock status from the catalog.
2. If a customer asks in Bengali, reply naturally and politely in Bengali. If they ask in English, reply in English.
3. If they ask about orders, use the verified live order details provided.
4. NEVER disclose internal supplier costs, profit margins, database configurations, admin credentials, or API keys.
5. Be concise, polite, and warmly guide customers to checkout or reach out via WhatsApp (${contactPhone}) if needed.`;

    // 5. Build Multi-Turn Message Array
    const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    if (Array.isArray(history) && history.length > 0) {
      history.slice(-8).forEach((h: { role: string; content: string }) => {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({
            role: h.role as "user" | "assistant",
            content: String(h.content),
          });
        }
      });
    }

    messages.push({ role: "user", content: message.trim() });

    // 6. Invoke LLM if configured, else provide intelligent contextual response
    let reply = "";
    let tokensUsed = 0;

    if (aiSetting?.apiKeyEncrypted) {
      try {
        const llmRes = await callLLM(messages, {
          provider: aiSetting.provider,
          apiKeyEncrypted: aiSetting.apiKeyEncrypted,
          modelName: aiSetting.modelName,
        });
        reply = llmRes.text;
        tokensUsed = llmRes.tokensUsed || 0;
      } catch (llmErr: any) {
        console.error("[Customer AI] LLM Provider Error:", llmErr);
        // Graceful fallback per AGENTS.md guardrails
        reply = `আসসালামু আলাইকুম! আপনার অনুসন্ধানের জন্য ধন্যবাদ। এই মুহূর্তে আমাদের লাইভ এআই সার্ভারে সংযোগ পেতে সমস্যা হচ্ছে। সুন্দরবনের খাঁটি মধু, তেল, ঘি বা অর্ডারের বিষয়ে তাৎক্ষণিক সহায়তার জন্য দয়া করে আমাদের হোয়াটসঅ্যাপে (+৮৮০ ১৬১৪ ১১৩০৮২) সরাসরি বার্তা পাঠান।`;
      }
    } else {
      // If AI key is not yet entered by admin in /admin/ai
      if (orderTrackingContext) {
        reply = orderTrackingContext.includes("No order")
          ? `আপনার ট্র্যাকিং আইডি (${trackingMatch?.[0]}) অনুযায়ী কোনো অর্ডার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আপনার কনফার্মেশন মেসেজ থেকে সঠিক ৮ ডিজিটের আইডিটি লিখুন।`
          : `📦 আপনার অর্ডারের তথ্য:\n${orderTrackingContext}`;
      } else {
        reply = `🌿 আসসালামু আলাইকুম! এনমারে আপনাকে স্বাগতম। আমাদের সুন্দরবনের কাঁচা মধু, কাঠের ঘানিতে ভাঙা খাঁটি সরিষার তেল, গাওয়া ঘি ও অর্গানিক মসলা সম্পর্কে জানতে আমাদের প্রোডাক্ট ক্যাটালগ দেখুন অথবা সরাসরি আমাদের হটলাইনে (+৮৮০ ১৬১৪ ১১৩০৮২) যোগাযোগ করুন।`;
      }
    }

    // 7. Log Conversation Safely (without leaking sensitive data)
    prisma.aIConversationLog
      .create({
        data: {
          sessionId: sessionId || "storefront-chat",
          userMessage: message.trim(),
          aiResponse: reply,
          tokensUsed: tokensUsed || 50,
        },
      })
      .catch((e) => console.error("[AI Log Error]:", e));

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("[Customer AI Route Error]:", error);
    return NextResponse.json({
      success: true,
      reply: "We are currently experiencing high inquiry volume. Please contact us via WhatsApp at +880 1614 113082.",
    });
  }
}
