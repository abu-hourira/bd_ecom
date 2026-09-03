// app/api/admin/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { callLLM, ChatMessage } from "@/lib/ai-provider";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 1. Fetch AI Configuration
    const aiSetting = await prisma.aISetting.findFirst({
      orderBy: { id: "desc" },
    });

    // 2. Fetch Live Store Operations Data (Admin Context)
    const [
      totalProducts,
      lowStockProducts,
      recentOrders,
      totalCustomers,
      activePromos,
      totalCategories,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 10 } },
        select: { id: true, name: true, stockQuantity: true, unitQuantity: true, unit: true, price: true, category: { select: { name: true } } } as any,
        take: 15,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          orderNumber: true,
          trackingId: true,
          totalAmount: true,
          orderStatus: true,
          customerName: true,
          customerPhone: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.promoCode.findMany({
        where: { isActive: true },
        select: { code: true, discountType: true, discountValue: true, usageCount: true },
      }),
      prisma.category.count(),
    ]);

    const lowStockSummary =
      lowStockProducts.length > 0
        ? (lowStockProducts as any[])
            .map((p: any) => `- ${p.name} (${p.category?.name || "General"}): only ${p.stockQuantity} ${p.unit} remaining (Price: ৳${p.price})`)
            .join("\n")
        : "All products currently have healthy inventory levels (>10 units).";

    const recentOrdersSummary =
      recentOrders.length > 0
        ? recentOrders
            .map(
              (o) =>
                `- Order #${o.orderNumber} [${o.trackingId}]: ৳${o.totalAmount} (${o.orderStatus}) | Pay: ${o.paymentMethod} (${o.paymentStatus}) | Customer: ${o.customerName}`
            )
            .join("\n")
        : "No recent orders recorded.";

    const promoSummary =
      activePromos.length > 0
        ? activePromos
            .map((pr) => `- Code '${pr.code}': ${pr.discountType} of ${pr.discountValue} (Used ${pr.usageCount} times)`)
            .join("\n")
        : "No active promo campaigns currently running.";

    // 3. Construct Admin System Prompt
    const adminSystemPrompt = `You are the expert internal AI Operations & Store Management Assistant for the store administrator of ENMAR Organic Food BD.
Your role is to assist the admin with real-time operations, analytics, product copy generation, restock forecasting, marketing copy, and customer support drafting.

LIVE STORE TELEMETRY:
- Total Products in Catalog: ${totalProducts} across ${totalCategories} categories
- Registered Customer Accounts: ${totalCustomers}
- Active Promo Campaigns:\n${promoSummary}

LOW-STOCK INVENTORY ALERTS (<=10 units):\n${lowStockSummary}

RECENT ORDERS QUEUE:\n${recentOrdersSummary}

ACTION & SAFETY MODEL:
- You may freely read and summarize store telemetry to answer questions, detect trends, and draft high-converting copy.
- If proposing changes to prices, publishing new items, updating stock, or changing order statuses, clearly specify the proposed action so the admin can review and confirm it before execution.
- Maintain a professional, data-driven, and supportive tone. Fluent in English and Bengali.`;

    // 4. Construct Multi-turn Messages
    const messages: ChatMessage[] = [{ role: "system", content: adminSystemPrompt }];

    if (Array.isArray(history) && history.length > 0) {
      history.slice(-10).forEach((h: { role: string; content: string }) => {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({
            role: h.role as "user" | "assistant",
            content: String(h.content),
          });
        }
      });
    }

    messages.push({ role: "user", content: message.trim() });

    // 5. Invoke LLM if configured, else intelligent fallback
    let reply = "";
    let tokensUsed = 0;
    const startTime = Date.now();

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
        console.error("[Admin AI] LLM Provider Error:", llmErr);
        reply = `⚠️ **LLM Connection Error:** Could not reach the configured AI provider (${aiSetting.provider} - ${aiSetting.modelName}).\n\n*Error details:* ${llmErr.message}\n\nPlease check your API key in **AI Settings** tab.`;
      }
    } else {
      reply = `🤖 **ENMAR Admin AI Assistant (Standing By)**\n\nTo enable full open-ended conversational AI intelligence with live model reasoning, please input your **API Key** in the **AI Settings** tab above.\n\n**Current Live Store Snapshot:**\n- Catalog: ${totalProducts} Products (${totalCategories} Categories)\n- Registered Customers: ${totalCustomers}\n- Recent Orders: ${recentOrders.length} in queue\n- Low Stock Items: ${lowStockProducts.length}\n\n*Ready to draft product descriptions, analyze sales trends, and create promotional banners once your API key is saved.*`;
    }

    const latencyMs = Date.now() - startTime;

    // Log admin conversation for telemetry audit
    await prisma.aIConversationLog
      .create({
        data: {
          sessionId: sessionId || "admin-chat",
          provider: aiSetting?.provider || "gemini_web2api",
          modelName: aiSetting?.modelName || "gemini-3.6-flash",
          latencyMs,
          source: "ADMIN",
          userMessage: message.trim(),
          aiResponse: reply,
          tokensUsed: tokensUsed || 50,
        },
      })
      .catch((e) => console.error("[Log AI Exception]:", e));

    return NextResponse.json({
      success: true,
      reply,
      tokensUsed,
      provider: aiSetting?.provider || "gemini_web2api",
      modelName: aiSetting?.modelName || "gemini-3.6-flash",
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Admin AI Route Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
