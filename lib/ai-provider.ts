// lib/ai-provider.ts
import { decryptAES } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { ensureGeminiServerRunning } from "@/lib/gemini-server-manager";

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
 * Clean AI responses: Strips internal thinking scratchpads, "Here's a thinking process", <think>/<thought> tags, and constraint checklists
 */
export function cleanAiResponse(raw: string): string {
  if (!raw) return "";
  let text = raw.trim();

  // 1. Strip XML-style thinking and reasoning tags
  text = text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "");
  text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, "");
  text = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");
  text = text.replace(/<scratchpad>[\s\S]*?<\/scratchpad>/gi, "");
  text = text.replace(/```(?:thought|think|thinking|scratchpad)[\s\S]*?```/gi, "").trim();

  // Strip unclosed opening thinking tags if truncated mid-thought
  text = text.replace(/<(?:think(?:ing)?|thought|reasoning|scratchpad)>[\s\S]*$/gi, "").trim();

  // 2. Handle pure thinking scratchpad (bullet lists analyzing constraints: "- Greeting:", "- Check constraints:", "- Let's do:")
  const isScratchpad =
    (text.startsWith("**") || text.startsWith("*") || text.startsWith("- ")) &&
    (text.includes("- Greeting:") ||
      text.includes("- Check constraints:") ||
      text.includes("- Brief reply") ||
      text.includes("- Let's do:") ||
      text.includes("- Output:") ||
      text.includes("Check constraints") ||
      text.includes("Output only the final message"));

  if (isScratchpad) {
    // Try to extract the best candidate text inside quotes within the scratchpad
    const quotedMatches = [
      ...text.matchAll(/(?:Output|Let's do|Draft|Response|Maybe)\s*:\s*["“]([^"”\n]+)["”]/gi),
    ];
    if (quotedMatches.length > 0) {
      text = quotedMatches[quotedMatches.length - 1][1].trim();
    } else {
      const allQuoted = [...text.matchAll(/["“]([^\n"”]{10,})["”]/g)];
      if (allQuoted.length > 0) {
        text = allQuoted[allQuoted.length - 1][1].trim();
      } else {
        text = "আসসালামু আলাইকুম! ENMAR Organic Food-এ আপনাকে স্বাগতম। আপনার কি কোনো নির্দিষ্ট পণ্য বা ডায়েটের বিষয়ে জানতে আগ্রহ আছে? আমি সাহায্য করতে পারি!";
      }
    }
  }

  // 3. Check for explicit "Output:", "Final Response:", "Answer:", "Response:" inside scratchpads
  const outputSplitRegex = /(?:^|\n)(?:[-*•]\s*)?(?:Final (?:Output|Response|Answer)|Output|Response|Answer|Revised (?:Response|Answer))\s*:\s*/gi;
  const matches = [...text.matchAll(outputSplitRegex)];
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const candidate = text.substring(lastMatch.index! + lastMatch[0].length).trim();
    if (candidate && !candidate.startsWith("- ") && !candidate.startsWith("* ")) {
      text = candidate;
    }
  }

  // 4. Strip "Here's a thinking process:" / "Thinking Process:" headers if present
  if (
    /^(?:Here'?s a thinking process|Thinking Process|Thought Process|Reasoning Process)/i.test(text) ||
    text.includes("Here's a thinking process:")
  ) {
    const responseMarkers = [
      /(?:(?:Draft|Final|Revised)\s+)?(?:Response|Answer|Output)\s*:\s*(?:\([^)]*\))?\s*[:\n]*/i,
      /(?:আসসালামু আলাইকুম|Hello|Hi|Greetings|Dear)/i,
    ];

    let foundIndex = -1;
    for (const marker of responseMarkers) {
      const match = marker.exec(text);
      if (match && match.index > 15) {
        foundIndex = match.index;
        if (
          text.substring(match.index).toLowerCase().includes("response:") ||
          text.substring(match.index).toLowerCase().includes("answer:") ||
          text.substring(match.index).toLowerCase().includes("output:")
        ) {
          const colonIdx = text.indexOf(":", match.index);
          if (colonIdx !== -1) {
            foundIndex = colonIdx + 1;
          }
        }
        break;
      }
    }

    if (foundIndex !== -1) {
      text = text.substring(foundIndex).trim();
    }
  }

  // 5. Strip surrounding double quotes if whole response is enclosed in quotes
  text = text.replace(/^["“'`]+|["”'`]+$/g, "").trim();

  // 6. If result is still empty or looks like broken thinking
  if (!text || text.startsWith("- Final check") || text.length < 3) {
    text = "আসসালামু আলাইকুম! ENMAR Organic Food-এ আপনাকে স্বাগতম। আপনার কি কোনো নির্দিষ্ট পণ্য বা তথ্যের প্রয়োজন? আমি সাহায্য করতে পারি!";
  }

  return text;
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
  gemini_web: {
    name: "Gemini Web (Free Cookie Auth)",
    baseUrl: "https://gemini.google.com",
    defaultModel: "gemini-web",
    placeholderKey: "__Secure-1PSID=...; __Secure-1PSIDTS=...;",
  },
  gemini_web2api: {
    name: "Gemini Web2API (Local Server :8081)",
    baseUrl: "http://localhost:8081/v1",
    defaultModel: "gemini-2.0-flash",
    placeholderKey: "sk-gemini",
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
    else if (provider === "gemini_web2api" || provider === "gemini-web2api") apiKey = "sk-gemini";
  }

  apiKey = apiKey.trim();
  if ((provider === "gemini_web2api" || provider === "gemini-web2api") && !apiKey) {
    apiKey = "sk-gemini";
  }

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
    // 0. Gemini Web (Free Cookie Reverse-Engineering Auth)
    // ─────────────────────────────────────────────────────────────
    if (provider === "gemini_web" || provider === "gemini-web") {
      const systemMessage = messages.find((m) => m.role === "system")?.content;
      const result = await callGeminiWeb(apiKey, messages, systemMessage);
      await recordAiRequest();
      return { text: cleanAiResponse(result.text), tokensUsed: result.tokensUsed || 0 };
    }

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
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const text = cleanAiResponse(rawText);
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
      const rawText = data.content?.[0]?.text || "";
      const text = cleanAiResponse(rawText);
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
        case "gemini_web2api":
        case "gemini-web2api":
          endpoint = "http://localhost:8081/v1/chat/completions";
          break;
        case "ollama":
          endpoint = "http://localhost:11434/v1/chat/completions";
          break;
        default:
          endpoint = "https://api.openai.com/v1/chat/completions";
      }
    }

    // Auto-spawn local Python Gemini server if targeting port 8081
    if (endpoint.includes("8081") || provider === "gemini_web2api" || provider === "gemini-web2api") {
      await ensureGeminiServerRunning();
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
    const rawText = data.choices?.[0]?.message?.content || "";
    const text = cleanAiResponse(rawText);
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

/**
 * Reverse-Engineered Gemini Web Client using __Secure-1PSID Cookie
 */
async function callGeminiWeb(
  cookies: string,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<{ text: string; tokensUsed: number }> {
  let cookieHeader = cookies.trim();
  if (!cookieHeader.includes("=")) {
    cookieHeader = `__Secure-1PSID=${cookieHeader};`;
  }

  // 1. Obtain session and SNlM0e token from gemini.google.com/app
  const initRes = await fetch("https://gemini.google.com/app", {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const html = await initRes.text();

  if (html.includes("accounts.google.com/ServiceLogin") || html.includes("Sign in - Google Accounts")) {
    throw new Error(
      "Gemini Web Cookie expired or invalid! Please log in to gemini.google.com and copy a fresh __Secure-1PSID cookie."
    );
  }

  const snlmMatch =
    html.match(/"SNlM0e":"([^"]+)"/) ||
    html.match(/WIZ_global_data[\s\S]*?"SNlM0e":"([^"]+)"/);
  const atValue = snlmMatch ? snlmMatch[1] : "";

  if (!atValue) {
    throw new Error(
      "Failed to extract session token from Gemini Web. Please ensure you copied both __Secure-1PSID and __Secure-1PSIDTS cookies."
    );
  }

  const blMatch = html.match(/"cfb2h":"([^"]+)"/) || html.match(/"bl":"([^"]+)"/);
  const blValue = blMatch ? blMatch[1] : "boq_assistant-bard-web-server_20240507.08_p0";

  // 2. Build conversation context
  let fullPrompt = "";
  if (systemPrompt) fullPrompt += `[System Instructions: ${systemPrompt}]\n\n`;
  for (const m of messages) {
    if (m.role === "system") continue;
    fullPrompt += `${m.role === "assistant" ? "Assistant" : "Customer"}: ${m.content}\n`;
  }
  fullPrompt += "\nAssistant: ";

  // 3. Google Gemini Internal Web RPC Payload
  const rpcPayload = [
    null,
    JSON.stringify([
      [fullPrompt, 0, null, [], null, null, 0],
      ["en"],
      ["", "", ""],
      null,
      null,
      null,
      [1],
      0,
      [],
      [],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      1,
    ]),
  ];

  const reqId = Math.floor(100000 + Math.random() * 900000);
  const streamUrl = `https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=${encodeURIComponent(
    blValue
  )}&_reqid=${reqId}&rt=c`;

  const bodyData = new URLSearchParams();
  bodyData.append("f.req", JSON.stringify(rpcPayload));
  bodyData.append("at", atValue);

  const res = await fetch(streamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Cookie: cookieHeader,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      Origin: "https://gemini.google.com",
      Referer: "https://gemini.google.com/app",
      "X-Same-Domain": "1",
    },
    body: bodyData.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Web HTTP error (${res.status}): ${errText.slice(0, 180)}`);
  }

  const responseText = await res.text();

  // 4. Parse Google RPC Chunks
  const lines = responseText.split("\n");
  let parsedText = "";

  for (const line of lines) {
    if (!line.includes("wrb.fr")) continue;
    try {
      const cleanLine = line.replace(/^\)\]\}'/, "").trim();
      const parsed = JSON.parse(cleanLine);
      for (const item of parsed) {
        if (Array.isArray(item) && item[0] === "wrb.fr" && typeof item[2] === "string") {
          const inner = JSON.parse(item[2]);
          if (Array.isArray(inner) && Array.isArray(inner[4]) && inner[4][0]) {
            const candidate = inner[4][0];
            if (Array.isArray(candidate) && typeof candidate[1] === "string") {
              parsedText = candidate[1];
            } else if (Array.isArray(candidate) && Array.isArray(candidate[1])) {
              parsedText = candidate[1][0] || "";
            }
          }
        }
      }
    } catch {
      // Continue parsing next chunk
    }
  }

  // Fallback regex extraction
  if (!parsedText) {
    const match = responseText.match(/\["rc_[a-z0-9]+",\["([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (match && match[1]) {
      try {
        parsedText = JSON.parse(`"${match[1]}"`);
      } catch {
        parsedText = match[1];
      }
    }
  }

  if (!parsedText) {
    throw new Error("Could not extract reply from Gemini Web. Please verify your cookie or try asking again.");
  }

  const cleaned = cleanAiResponse(parsedText);
  return {
    text: cleaned || parsedText.trim(),
    tokensUsed: Math.ceil((cleaned || parsedText).length / 4),
  };
}
