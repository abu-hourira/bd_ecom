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
        select: { key: true, value: true },
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

    const siteName = settingsMap.brandName || settingsMap.site_name || "ENMAR Organic Food";
    const siteTagline = settingsMap.brandTagline || settingsMap.site_tagline || "100% Pure & Organic Food";
    const contactPhone = settingsMap.contactPhone || settingsMap.whatsappNumber || settingsMap.contact_phone || "+880 1614 113082";
    const contactEmail = settingsMap.contactEmail || settingsMap.contact_email || "support@enmar.shop";
    const contactAddress = settingsMap.contactAddress || settingsMap.contact_address || "House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh";
    const insideDhakaFee = settingsMap.shippingFlat || settingsMap.delivery_charge_inside_dhaka || "70";
    const outsideDhakaFee = settingsMap.shippingOutside || settingsMap.delivery_charge_outside_dhaka || "130";
    const freeDeliveryMin = settingsMap.freeShippingThreshold || settingsMap.free_delivery_threshold || "1500";

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

    // 3. In-Chat Real Database Order Processor & Tracking Intent
    let orderTrackingContext = "";
    let inChatOrderCreatedContext = "";

    // Combine recent conversation history with current message to support multi-turn ordering
    const fullConversationText = [
      ...(Array.isArray(history) ? history.map((h: any) => String(h.content || "")) : []),
      message,
    ].join("\n");

    const phoneMatch = fullConversationText.match(/(?:\+?88)?01[3-9]\d{8}/);
    const orderIntentWords = /(অর্ডার|order|কিনব|চাই|need|buy|পাঠিয়ে দিন|পাঠান|পৌছে দিন|নিব|নিব|নেব|দেওয়া যাবে)/i;
    
    if (phoneMatch && orderIntentWords.test(fullConversationText) && products.length > 0) {
      const detectedPhone = phoneMatch[0].replace(/^\+?88/, "");
      
      // Attempt to match a product from the current message first, then conversation history
      const matchedProduct: any =
        (products as any[]).find((p: any) =>
          message.toLowerCase().includes(String(p.name || "").toLowerCase()) ||
          (p.category?.name && message.toLowerCase().includes(String(p.category.name).toLowerCase()))
        ) ||
        (products as any[]).find((p: any) =>
          fullConversationText.toLowerCase().includes(String(p.name || "").toLowerCase()) ||
          (p.category?.name && fullConversationText.toLowerCase().includes(String(p.category.name).toLowerCase()))
        ) ||
        (products as any[])[0];

      if (matchedProduct && Number(matchedProduct.stockQuantity) > 0) {
        try {
          const rawPrice = Number(matchedProduct.discountPrice || matchedProduct.price || 0);
          const isOutside = /(বাইরে|outside|chittagong|sylhet|rajshahi|khulna|barishal|rangpur|mymensingh|গ্রাম|থানা|জেলা)/i.test(fullConversationText);
          const zone = isOutside ? "Outside Dhaka" : "Inside Dhaka";
          const shippingFeeNum = isOutside ? Number(outsideDhakaFee) : Number(insideDhakaFee);
          const subtotalNum = rawPrice;
          const totalNum = subtotalNum >= Number(freeDeliveryMin) ? subtotalNum : subtotalNum + shippingFeeNum;
          const appliedShipping = subtotalNum >= Number(freeDeliveryMin) ? 0 : shippingFeeNum;

          const ordNumber = `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
          const trkId = `ENM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

          // Extract potential customer name or fallback
          const nameLines = fullConversationText.split(/[\n,]/).map((s: string) => s.trim());
          const customerNameStr = nameLines.find((l: string) => l.length >= 3 && l.length <= 30 && !l.includes(detectedPhone) && !l.includes("ORD-") && !l.includes("ENM-")) || "Valued Customer";

          // Extract best shipping address
          const addressCandidate = nameLines.find((l: string) => /(ধানমন্ডি|মিরপুর|উত্তরা|গুলশান|বনানী|ঢাকা|রোড|বাড়ি|বাসা|ফ্ল্যাট|গ্রাম|থানা|জেলা|সেক্টর|ব্লক|মহল্লা)/i.test(l)) || fullConversationText.slice(0, 300);

          const createdOrder = await prisma.$transaction(async (tx) => {
            const ord = await tx.order.create({
              data: {
                orderNumber: ordNumber,
                trackingId: trkId,
                customerName: customerNameStr,
                customerEmail: "guest@enmar.bd",
                customerPhone: detectedPhone,
                shippingAddress: addressCandidate,
                deliveryZone: zone,
                subtotal: subtotalNum,
                discountAmount: 0,
                shippingFee: appliedShipping,
                totalAmount: totalNum,
                paymentMethod: "COD",
                paymentStatus: "PENDING",
                orderStatus: "PENDING",
                customerNotes: "Created via ENMAR AI Customer Assistant in chat",
                items: {
                  create: [
                    {
                      productId: Number(matchedProduct.id),
                      productName: String(matchedProduct.name),
                      unitPrice: rawPrice,
                      quantity: 1,
                      unit: String(matchedProduct.unit || "piece"),
                      itemImage: Array.isArray(matchedProduct.images) ? String(matchedProduct.images[0]) : null,
                      totalPrice: rawPrice,
                    },
                  ],
                },
              },
            });

            // Decrement Stock
            await tx.product.update({
              where: { id: Number(matchedProduct.id) },
              data: { stockQuantity: { decrement: 1 } },
            });

            await tx.orderHistory.create({
              data: {
                orderId: ord.id,
                status: "PENDING",
                note: "Order created directly via ENMAR AI Customer Assistant.",
                actorRole: "AI_ASSISTANT",
                actorName: "ENMAR AI Assistant",
              },
            });

            return ord;
          });

          inChatOrderCreatedContext = `\n[SUCCESSFULLY CREATED REAL DATABASE ORDER]: Order #${createdOrder.orderNumber} (Tracking ID: ${createdOrder.trackingId}) has been successfully placed into the live store database! Product: '${matchedProduct.name}' | Total Amount: ৳${createdOrder.totalAmount} (Cash on Delivery) | Customer Name: ${customerNameStr} | Delivery Phone: ${detectedPhone} | Delivery Address: ${addressCandidate} | Delivery Zone: ${zone}.`;
        } catch (orderErr) {
          console.error("[In-Chat Order Creation Error]:", orderErr);
        }
      }
    }

    // B. Check for Order Tracking Intent in message
    const trackingMatch = message.match(/ENM-[A-Z0-9]{5,12}/i) || message.match(/ENM\d{4,10}/i) || message.match(/ORD-\d{6,12}-\d{3,5}/i);
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
${inChatOrderCreatedContext}

CRITICAL OPERATIONAL & ORDERING RULES:
1. ORDER PLACEMENT POLICY:
   - If [SUCCESSFULLY CREATED REAL DATABASE ORDER] is present above, confirm the order enthusiastically in Bengali/English with the exact Order Number, Tracking ID, Total Amount, and tell them: "আমাদের প্রতিনিধি খুব শীঘ্রই কল করে ডেলিভারি নিশ্চিত করবেন।"
   - If a customer wants to place an order but HAS NOT provided their phone number or address yet, kindly tell them:
     "অর্ডার কনফার্ম করতে অনুগ্রহ করে আপনার: ১. নাম, ২. মোবাইল নম্বর, এবং ৩. সম্পূর্ণ ডেলিভারি ঠিকানা এখানে লিখুন। অথবা সরাসরি আমাদের [চেকআউট পেজ](/checkout)-এ গিয়ে কার্ট থেকে অর্ডার সম্পন্ন করতে পারেন।"
   - NEVER tell a customer "আপনার অর্ডার সম্পন্ন হয়েছে" without having an actual verified Order Number and Tracking ID from the database!
2. Always base product availability, exact weight/measurement units, and prices ONLY on the LIVE PRODUCT CATALOG above.
3. If a customer asks in Bengali, reply naturally and politely in Bengali. If they ask in English, reply in English.
4. If they ask about order status, use the verified live order details provided.
5. NEVER disclose internal supplier costs, profit margins, database configurations, admin credentials, or API keys.
6. Be concise, polite, and warmly guide customers to checkout or reach out via WhatsApp (${contactPhone}) if needed.`;

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
          baseUrl: aiSetting.baseUrl || undefined,
          modelName: aiSetting.modelName,
          temperature: aiSetting.temperature ?? 0.7,
          maxTokens: aiSetting.maxTokens ?? 1000,
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
