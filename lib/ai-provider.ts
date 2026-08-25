// lib/ai-provider.ts
import { decryptAES } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  provider: string; // "openai" | "anthropic" | "gemini" | "deepseek" | "openrouter" | "groq"
  apiKeyEncrypted?: string;
  apiKey?: string;
  modelName: string;
  systemPrompt?: string;
  baseUrl?: string;
}

/**
 * Check if AI Quota is currently marked as exhausted
 */
export async function getAiQuotaStatus() {
  try {
    const [exceededSetting, errorSetting, countSetting, limitSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "ai_quota_exceeded" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_quota_error_msg" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_requests_this_month" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_monthly_request_limit" } }),
    ]);

    const isExhausted = exceededSetting?.value === "true";
    const errorMsg = errorSetting?.value || "";
    const requestsCount = Number(countSetting?.value || "0");
    const limit = Number(limitSetting?.value || "1000");

    const limitReached = limit > 0 && requestsCount >= limit;

    return {
      isExhausted: isExhausted || limitReached,
      errorMsg: isExhausted
        ? errorMsg || "API provider quota exhausted (Rate Limit / Insufficient Credits)."
        : limitReached
        ? `Monthly request limit reached (${requestsCount}/${limit} requests).`
        : "",
      requestsCount,
      limit,
      percentage: limit > 0 ? Math.min(100, Math.round((requestsCount / limit) * 100)) : 0,
    };
  } catch (e) {
    return { isExhausted: false, errorMsg: "", requestsCount: 0, limit: 1000, percentage: 0 };
  }
}

/**
 * Record a successful AI request
 */
export async function recordAiRequest() {
  try {
    const countSetting = await prisma.siteSetting.findUnique({ where: { key: "ai_requests_this_month" } });
    const current = Number(countSetting?.value || "0");
    await prisma.siteSetting.upsert({
      where: { key: "ai_requests_this_month" },
      update: { value: String(current + 1) },
      create: { key: "ai_requests_this_month", value: "1", group: "ai" },
    });
  } catch (e) {
    // silent
  }
}

/**
 * Record Quota Exhausted error in DB
 */
export async function recordAiQuotaExhausted(errorText: string) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "ai_quota_exceeded" },
      update: { value: "true" },
      create: { key: "ai_quota_exceeded", value: "true", group: "ai" },
    });
    await prisma.siteSetting.upsert({
      where: { key: "ai_quota_error_msg" },
      update: { value: errorText },
      create: { key: "ai_quota_error_msg", value: errorText, group: "ai" },
    });
    await prisma.siteSetting.upsert({
      where: { key: "ai_last_exhausted_at" },
      update: { value: new Date().toISOString() },
      create: { key: "ai_last_exhausted_at", value: new Date().toISOString(), group: "ai" },
    });
  } catch (e) {
    console.error("[recordAiQuotaExhausted Exception]:", e);
  }
}

/**
 * Reset AI Quota Status
 */
export async function resetAiQuotaStatus() {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "ai_quota_exceeded" },
      update: { value: "false" },
      create: { key: "ai_quota_exceeded", value: "false", group: "ai" },
    });
    await prisma.siteSetting.upsert({
      where: { key: "ai_quota_error_msg" },
      update: { value: "" },
      create: { key: "ai_quota_error_msg", value: "", group: "ai" },
    });
  } catch (e) {
    console.error("[resetAiQuotaStatus Exception]:", e);
  }
}

/**
 * Call the configured LLM provider directly via native HTTP fetch
 */
export async function callLLM(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ text: string; tokensUsed?: number }> {
  let apiKey = config.apiKey || (config.apiKeyEncrypted ? decryptAES(config.apiKeyEncrypted) : "");
  let provider = (config.provider || "openai").toLowerCase();

  // Environment variable fallback if not set in DB
  if (!apiKey || apiKey.trim() === "") {
    if (provider === "openrouter") apiKey = process.env.OPENROUTER_API_KEY || "";
    else if (provider === "openai") apiKey = process.env.OPENAI_API_KEY || "";
    else if (provider === "gemini" || provider === "google") apiKey = process.env.GEMINI_API_KEY || "";
    else if (provider === "anthropic") apiKey = process.env.ANTHROPIC_API_KEY || "";
    else if (provider === "groq") apiKey = process.env.GROQ_API_KEY || "";
  }

  apiKey = apiKey.trim();

  // Smart provider auto-detection based on API key prefix to prevent mismatched settings
  if (apiKey.startsWith("sk-or-")) {
    provider = "openrouter";
  } else if (apiKey.startsWith("AIzaSy") || apiKey.startsWith("AIza")) {
    provider = "gemini";
  } else if (apiKey.startsWith("gsk_")) {
    provider = "groq";
  } else if (apiKey.startsWith("sk-ant-")) {
    provider = "anthropic";
  }

  if (!apiKey) {
    throw new Error(`No API key configured for ${provider}. Please enter your API key in the AI Settings tab.`);
  }

  let model = config.modelName?.trim() || "";
  if (!model || ((provider === "gemini" || provider === "google") && (model === "gemini-1.5-flash" || model === "gemini-2.0-flash" || model === "gemini-1.5-pro"))) {
    if (provider === "anthropic") model = "claude-3-5-sonnet-20241022";
    else if (provider === "gemini" || provider === "google") model = "gemini-3.6-flash";
    else if (provider === "openrouter") model = "nvidia/nemotron-3.5-lightning:free";
    else if (provider === "groq") model = "llama3-8b-8192";
    else model = "gpt-4o-mini";
  } else if (!model) {
    if (provider === "anthropic") model = "claude-3-5-sonnet-20241022";
    else if (provider === "gemini" || provider === "google") model = "gemini-3.6-flash";
    else if (provider === "openrouter") model = "nvidia/nemotron-3.5-lightning:free";
    else if (provider === "groq") model = "llama3-8b-8192";
    else model = "gpt-4o-mini";
  }

  try {
    // 1. Google Gemini Provider
    if (provider === "gemini" || provider === "google") {
      const cleanModel = model.replace(/^models\//, "");
      
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      const nonSystemMessages = messages.filter((m) => m.role !== "system" && m.content?.trim());
      
      for (const m of nonSystemMessages) {
        const role = m.role === "assistant" ? "model" : "user";
        contents.push({
          role,
          parts: [{ text: m.content.trim() }],
        });
      }

      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: "Hello" }] });
      }

      const systemInstruction = messages.find((m) => m.role === "system" && m.content?.trim());
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
      const payload: any = { contents };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction.content.trim() }],
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429 || errText.includes("RESOURCE_EXHAUSTED") || errText.includes("quota")) {
          await recordAiQuotaExhausted("Google Gemini Quota Exhausted: " + errText.slice(0, 150));
        }
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      await recordAiRequest();
      return { text, tokensUsed: data.usageMetadata?.totalTokenCount || 0 };
    }

    // 2. OpenAI / OpenRouter / Groq / DeepSeek Provider
    if (provider === "openai" || provider === "groq" || provider === "deepseek" || provider === "openrouter") {
      const endpoint =
        provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : provider === "openrouter"
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      if (provider === "openrouter") {
        headers["HTTP-Referer"] = process.env.NEXTAUTH_URL || "https://enmar.shop";
        headers["X-Title"] = "ENMAR Organic Food";
      }

      const cleanMessages = messages
        .filter((m) => m.content?.trim())
        .map((m) => ({ role: m.role, content: m.content.trim() }));

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: cleanMessages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429 || errText.includes("insufficient_quota") || errText.includes("rate_limit")) {
          await recordAiQuotaExhausted(`${provider} Quota Exhausted: ` + errText.slice(0, 150));
        }
        throw new Error(`${provider.toUpperCase()} API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      await recordAiRequest();
      return { text, tokensUsed: data.usage?.total_tokens || 0 };
    }

    // 3. Anthropic Claude Provider
    if (provider === "anthropic") {
      const systemMessage = messages.find((m) => m.role === "system")?.content || "";
      const nonSystemMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemMessage,
          messages: nonSystemMessages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429 || errText.includes("rate_limit") || errText.includes("credit")) {
          await recordAiQuotaExhausted("Claude Quota Exhausted: " + errText.slice(0, 150));
        }
        throw new Error(`Anthropic API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      await recordAiRequest();
      return { text, tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) };
    }

    throw new Error(`Unsupported AI provider: ${provider}`);
  } catch (error: any) {
    if (error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      await recordAiQuotaExhausted(error.message.slice(0, 150));
    }
    throw error;
  }
}
