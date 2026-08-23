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

    // 1. Fetch AI Configuration
    const aiSetting = await prisma.aISetting.findFirst({
      where: { isActive: true },
      orderBy: { id: "desc" },
    });

    // 2. Fetch Public Product Catalog for Context Grounding
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
        price: true,
        discountPrice: true,
        stockQuantity: true,
        unit: true,
        description: true,
        organicCertified: true,
      },
      take: 50,
    });

    const productCatalogSummary = products
      .map(
        (p) =>
          `- ${p.name} (${p.category?.name || "General"}): ৳${p.discountPrice || p.price} per ${p.unit} | Stock: ${
            p.stockQuantity > 0 ? "In Stock" : "Out of Stock"
          } | Certified Organic: ${p.organicCertified ? "Yes" : "No"}`
      )
      .join("\n");

    // 3. Check for Order Tracking Intent in message
    let orderTrackingContext = "";
    const trackingMatch = message.match(/ENM-[A-Z0-9]{6,10}/i);
    if (trackingMatch) {
      const trackingId = trackingMatch[0].toUpperCase();
      const order = await prisma.order.findUnique({
        where: { trackingId },
        select: {
          trackingId: true,
          orderStatus: true,
          courierPartner: true,
          courierTrackingId: true,
          totalAmount: true,
          createdAt: true,
        },
      });

      if (order) {
        orderTrackingContext = `\n[Verified Order Details for Tracking ID ${trackingId}]: Status is '${order.orderStatus}', Total: ৳${order.totalAmount}, Courier: ${order.courierPartner || "Processing at ENMAR facility"} (Tracking No: ${order.courierTrackingId || "Pending"}), Created: ${order.createdAt.toISOString()}.`;
      } else {
        orderTrackingContext = `\n[Tracking Query for ID ${trackingId}]: No order was found in the system matching this tracking ID.`;
      }
    }

    // 4. Construct System Prompt with Strict Data Isolation
    const systemPrompt = `You are the polite, knowledgeable, and fluent AI Shopping Assistant for ENMAR (enmar.bd), Bangladesh's premier 100% pure organic food brand.
Brand identity: Warm, earthy, authentic organic food (raw Sundarban honey, bilona cow ghee, wood-pressed cold mustard oil, organic spices, pantry staples).

DELIVERY POLICIES:
- Inside Dhaka: ৳70 (24 to 48 hours)
- Outside Dhaka: ৳130 (24 to 72 hours)
- Free Delivery: Automatically applied on orders of ৳1,500 and above nationwide!
- Payment Methods: Cash on Delivery (COD) and Online Payment via SSLCommerz (bKash, Nagad, Rocket, Visa/Mastercard).

CURRENT STORE CATALOG:
${productCatalogSummary}
${orderTrackingContext}

CRITICAL DATA ISOLATION & SECURITY RULES:
1. NEVER disclose internal profit margins, supplier costs, admin credentials, database configuration, or API keys under any circumstance.
2. If asked about another customer's orders, personal details, or phone numbers, politely refuse citing privacy and data protection policies.
3. Only assist with genuine product inquiries, organic health/cooking usage, delivery rates, and order tracking.
4. Respond in the customer's preferred language (Bangla or English). If they ask in Bengali, reply naturally in clear Bengali. If they ask in English, reply in English.
5. Be concise, polite, helpful, and encourage healthy organic living.`;

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
