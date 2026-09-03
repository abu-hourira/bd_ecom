// lib/ai-provider.ts
import { decryptAES } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  provider: string; // "openai" | "anthropic" | "gemini" | "deepseek" | "openrouter" | "groq" | "mistral" | "xai" | "perplexity" | "ollama" | "together" | "custom"
  apiKeyEncrypted?: string;
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Default base URLs and models for popular AI providers
 */
export const AI_PROVIDER_DEFAULTS: Record<
  string,
  { name: string; baseUrl: string; defaultModel: string; placeholderKey: string }
> = {
  openai: {
    name: "OpenAI (ChatGPT)",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    placeholderKey: "sk-proj-...",
  },
  gemini: {
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    placeholderKey: "AIzaSy...",
  },
  anthropic: {
    name: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    placeholderKey: "sk-ant-...",
  },
  deepseek: {
    name: "DeepSeek AI",
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
    placeholderKey: "sk-...",
  },
  groq: {
    name: "Groq (High-Speed Llama)",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    placeholderKey: "gsk_...",
  },
  openrouter: {
    name: "OpenRouter (All Models Gateway)",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    placeholderKey: "sk-or-v1-...",
  },
  mistral: {
    name: "Mistral AI",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-large-latest",
    placeholderKey: "...",
  },
  xai: {
    name: "xAI (Grok)",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-2-latest",
    placeholderKey: "xai-...",
  },
  perplexity: {
    name: "Perplexity AI",
    baseUrl: "https://api.perplexity.ai",
    defaultModel: "sonar-pro",
    placeholderKey: "pplx-...",
  },
  together: {
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    placeholderKey: "...",
  },
  ollama: {
    name: "Ollama (Local Offline LLM)",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    placeholderKey: "Optional (ollama)",
  },
  custom: {
    name: "Custom (Any OpenAI-Compatible Endpoint)",
    baseUrl: "https://your-custom-ai-endpoint.com/v1",
    defaultModel: "custom-model",
    placeholderKey: "Your API Key",
  },
};

/**
 * Check if AI Quota is currently marked as exhausted, with automatic monthly & limit resets
 */
export async function getAiQuotaStatus() {
  try {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-08"

    const [
      exceededSetting,
      errorSetting,
      countSetting,
      limitSetting,
      monthSetting,
      autoResetSetting,
      lastExhaustedSetting,
    ] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "ai_quota_exceeded" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_quota_error_msg" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_requests_this_month" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_monthly_request_limit" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_quota_current_month" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_auto_reset_on_limit" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_last_exhausted_at" } }),
    ]);

    let requestsCount = Number(countSetting?.value || "0");
    const limit = Number(limitSetting?.value || "1000");
    const savedMonth = monthSetting?.value || currentMonthKey;
    const autoResetEnabled = autoResetSetting ? autoResetSetting.value === "true" : true;

    // 1. Monthly Calendar Auto-Rollover
    if (savedMonth !== currentMonthKey) {
      requestsCount = 0;
      await Promise.all([
        prisma.siteSetting.upsert({
          where: { key: "ai_requests_this_month" },
          update: { value: "0" },
          create: { key: "ai_requests_this_month", value: "0", group: "ai" },
        }),
        prisma.siteSetting.upsert({
          where: { key: "ai_quota_current_month" },
          update: { value: currentMonthKey },
          create: { key: "ai_quota_current_month", value: currentMonthKey, group: "ai" },
        }),
        prisma.siteSetting.upsert({
          where: { key: "ai_quota_exceeded" },
          update: { value: "false" },
          create: { key: "ai_quota_exceeded", value: "false", group: "ai" },
        }),
      ]);
    }

    // 2. Limit-reached Auto-Reset
    if (limit > 0 && requestsCount >= limit && autoResetEnabled) {
      requestsCount = 0;
      await Promise.all([
        prisma.siteSetting.upsert({
          where: { key: "ai_requests_this_month" },
          update: { value: "0" },
          create: { key: "ai_requests_this_month", value: "0", group: "ai" },
        }),
        prisma.siteSetting.upsert({
          where: { key: "ai_quota_exceeded" },
          update: { value: "false" },
          create: { key: "ai_quota_exceeded", value: "false", group: "ai" },
        }),
      ]);
    }

    // 3. Auto-recovery cooldown for temporary provider rate limits (5 minutes)
    let isExhausted = exceededSetting?.value === "true";
    if (isExhausted && lastExhaustedSetting?.value) {
      const exhaustedTime = new Date(lastExhaustedSetting.value).getTime();
      const elapsedMinutes = (Date.now() - exhaustedTime) / (1000 * 60);
      if (elapsedMinutes >= 5) {
        isExhausted = false;
        await resetAiQuotaStatus();
      }
    }

    const errorMsg = errorSetting?.value || "";
    const limitReached = limit > 0 && requestsCount >= limit && !autoResetEnabled;

    return {
      isExhausted: isExhausted || limitReached,
      errorMsg: isExhausted
        ? errorMsg || "API provider rate limit encountered (Auto-recovering)."
        : limitReached
        ? `Monthly request limit reached (${requestsCount}/${limit} requests).`
        : "",
      requestsCount,
      limit,
      autoReset: autoResetEnabled,
      percentage: limit > 0 ? Math.min(100, Math.round((requestsCount / limit) * 100)) : 0,
    };
  } catch (e) {
    return { isExhausted: false, errorMsg: "", requestsCount: 0, limit: 1000, autoReset: true, percentage: 0 };
  }
}

/**
 * Record a successful AI request
 */
export async function recordAiRequest() {
  try {
    const countSetting = await prisma.siteSetting.findUnique({ where: { key: "ai_requests_this_month" } });
    const limitSetting = await prisma.siteSetting.findUnique({ where: { key: "ai_monthly_request_limit" } });
    const autoResetSetting = await prisma.siteSetting.findUnique({ where: { key: "ai_auto_reset_on_limit" } });

    const current = Number(countSetting?.value || "0");
    const limit = Number(limitSetting?.value || "1000");
    const autoReset = autoResetSetting ? autoResetSetting.value === "true" : true;

    if (limit > 0 && current >= limit && autoReset) {
      await prisma.siteSetting.upsert({
        where: { key: "ai_requests_this_month" },
        update: { value: "1" },
        create: { key: "ai_requests_this_month", value: "1", group: "ai" },
      });
      return;
    }

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
 * Reset AI Quota Status & Clear Exhaustion Flag
 */
export async function resetAiQuotaStatus() {
  try {
    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: "ai_quota_exceeded" },
        update: { value: "false" },
        create: { key: "ai_quota_exceeded", value: "false", group: "ai" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "ai_quota_error_msg" },
        update: { value: "" },
        create: { key: "ai_quota_error_msg", value: "", group: "ai" },
      }),
    ]);
  } catch (e) {
    console.error("[resetAiQuotaStatus Exception]:", e);
  }
}

/**
 * Reset AI Request Count to 0
 */
export async function resetAiRequestCount() {
  try {
    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: "ai_requests_this_month" },
        update: { value: "0" },
        create: { key: "ai_requests_this_month", value: "0", group: "ai" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "ai_quota_exceeded" },
        update: { value: "false" },
        create: { key: "ai_quota_exceeded", value: "false", group: "ai" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "ai_quota_error_msg" },
        update: { value: "" },
        create: { key: "ai_quota_error_msg", value: "", group: "ai" },
      }),
    ]);
  } catch (e) {
    console.error("[resetAiRequestCount Exception]:", e);
  }
}

/**
 * Universal LLM Execution Engine — Supports ANY AI Provider, Custom Base URL & Model
 */
export async function callLLM(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ text: string; tokensUsed?: number }> {
  let apiKey = config.apiKey || (config.apiKeyEncrypted ? decryptAES(config.apiKeyEncrypted) : "");
  let provider = (config.provider || "openai").toLowerCase();
  let customBaseUrl = config.baseUrl?.trim() || "";

  // Environment variable fallback if not set in DB
  if (!apiKey || apiKey.trim() === "") {
    if (provider === "openrouter") apiKey = process.env.OPENROUTER_API_KEY || "";
    else if (provider === "openai") apiKey = process.env.OPENAI_API_KEY || "";
    else if (provider === "gemini" || provider === "google") apiKey = process.env.GEMINI_API_KEY || "";
    else if (provider === "anthropic") apiKey = process.env.ANTHROPIC_API_KEY || "";
    else if (provider === "groq") apiKey = process.env.GROQ_API_KEY || "";
    else if (provider === "deepseek") apiKey = process.env.DEEPSEEK_API_KEY || "";
  }

  apiKey = apiKey.trim();

  // Smart provider auto-detection if generic
  if (provider === "openai" || !provider) {
    if (apiKey.startsWith("sk-or-")) provider = "openrouter";
    else if (apiKey.startsWith("AIzaSy") || apiKey.startsWith("AIza")) provider = "gemini";
    else if (apiKey.startsWith("gsk_")) provider = "groq";
    else if (apiKey.startsWith("sk-ant-")) provider = "anthropic";
    else if (apiKey.startsWith("pplx-")) provider = "perplexity";
    else if (apiKey.startsWith("xai-")) provider = "xai";
  }

  // Ollama or local endpoint doesn't strictly require API key
  const isLocalOrOllama = provider === "ollama" || customBaseUrl.includes("localhost") || customBaseUrl.includes("127.0.0.1");
  if (!apiKey && !isLocalOrOllama) {
    throw new Error(`No API key configured for ${provider}. Please enter your API key in the AI Settings tab.`);
  }

  // Model resolution with provider-specific smart fallbacks
  let model = config.modelName?.trim() || "";
  if (!model) {
    const defaultInfo = AI_PROVIDER_DEFAULTS[provider] || AI_PROVIDER_DEFAULTS.openai;
    model = defaultInfo.defaultModel;
  }

  const temperature = config.temperature !== undefined ? Number(config.temperature) : 0.7;
  const maxTokens = config.maxTokens !== undefined ? Number(config.maxTokens) : 1000;

  try {
    // ─────────────────────────────────────────────────────────────
    // 1. Google Gemini Native Endpoint (if not using custom OpenAI proxy)
    // ─────────────────────────────────────────────────────────────
    if ((provider === "gemini" || provider === "google") && !customBaseUrl.includes("/chat/completions")) {
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
      const base = customBaseUrl ? customBaseUrl.replace(/\/$/, "") : "https://generativelanguage.googleapis.com/v1beta";
      const endpoint = `${base}/models/${cleanModel}:generateContent?key=${apiKey}`;
      const payload: any = { contents, generationConfig: { temperature, maxOutputTokens: maxTokens } };

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

    // ─────────────────────────────────────────────────────────────
    // 2. Anthropic Claude Native Endpoint
    // ─────────────────────────────────────────────────────────────
    if (provider === "anthropic" || provider === "claude") {
      const systemMessage = messages.find((m) => m.role === "system")?.content || "";
      const nonSystemMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const base = customBaseUrl ? customBaseUrl.replace(/\/$/, "") : "https://api.anthropic.com/v1";
      const endpoint = `${base}/messages`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
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

    // ─────────────────────────────────────────────────────────────
    // 3. Universal OpenAI-Compatible Engine (OpenAI, DeepSeek, Groq, OpenRouter, Mistral, xAI, Perplexity, Ollama, Custom URL)
    // ─────────────────────────────────────────────────────────────
    let endpoint = "";
    if (customBaseUrl) {
      const cleanBase = customBaseUrl.replace(/\/$/, "");
      if (cleanBase.endsWith("/chat/completions")) {
        endpoint = cleanBase;
      } else {
        endpoint = `${cleanBase}/chat/completions`;
      }
    } else {
      switch (provider) {
        case "deepseek":
          endpoint = "https://api.deepseek.com/chat/completions";
          break;
        case "groq":
          endpoint = "https://api.groq.com/openai/v1/chat/completions";
          break;
        case "openrouter":
          endpoint = "https://openrouter.ai/api/v1/chat/completions";
          break;
        case "mistral":
          endpoint = "https://api.mistral.ai/v1/chat/completions";
          break;
        case "xai":
          endpoint = "https://api.x.ai/v1/chat/completions";
          break;
        case "perplexity":
          endpoint = "https://api.perplexity.ai/chat/completions";
          break;
        case "together":
          endpoint = "https://api.together.xyz/v1/chat/completions";
          break;
        case "ollama":
          endpoint = "http://localhost:11434/v1/chat/completions";
          break;
        default:
          endpoint = "https://api.openai.com/v1/chat/completions";
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    if (provider === "openrouter" || endpoint.includes("openrouter.ai")) {
      headers["HTTP-Referer"] = process.env.NEXTAUTH_URL || "https://enmar.shop";
      headers["X-Title"] = "ENMAR Organic Food";
    }

    const cleanMessages = messages
      .filter((m) => m.content?.trim())
      .map((m) => ({ role: m.role, content: m.content.trim() }));

    const payload: any = {
      model,
      messages: cleanMessages,
      temperature,
    };
    if (maxTokens) {
      payload.max_tokens = maxTokens;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
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
  } catch (error: any) {
    if (
      error.message?.includes("429") ||
      error.message?.includes("quota") ||
      error.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      await recordAiQuotaExhausted(error.message.slice(0, 150));
    }
    throw error;
  }
}
