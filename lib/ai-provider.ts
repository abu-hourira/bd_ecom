// lib/ai-provider.ts
import { decryptAES } from "@/lib/crypto";

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
 * Call the configured LLM provider directly via native HTTP fetch
 */
export async function callLLM(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ text: string; tokensUsed?: number }> {
  const apiKey = config.apiKey || (config.apiKeyEncrypted ? decryptAES(config.apiKeyEncrypted) : "");

  if (!apiKey) {
    throw new Error("No API key configured for AI provider.");
  }

  const provider = (config.provider || "openai").toLowerCase();
  const model = config.modelName || (provider === "anthropic" ? "claude-3-5-sonnet-20241022" : provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");

  // 1. Google Gemini Provider
  if (provider === "gemini" || provider === "google") {
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === "system");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload: any = { contents };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction.content }],
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "No response generated.";
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    return { text, tokensUsed };
  }

  // 2. Anthropic Claude Provider
  if (provider === "anthropic") {
    const systemMessage = messages.find((m) => m.role === "system")?.content || "";
    const conversationMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const endpoint = "https://api.anthropic.com/v1/messages";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system: systemMessage,
        messages: conversationMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "No response generated.";
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    return { text, tokensUsed };
  }

  // 3. OpenAI / DeepSeek / Groq / OpenRouter Provider (OpenAI Compatible)
  let endpoint = "https://api.openai.com/v1/chat/completions";
  if (provider === "deepseek") endpoint = "https://api.deepseek.com/v1/chat/completions";
  if (provider === "groq") endpoint = "https://api.groq.com/openai/v1/chat/completions";
  if (provider === "openrouter") endpoint = "https://openrouter.ai/api/v1/chat/completions";
  if (config.baseUrl) endpoint = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider.toUpperCase()} API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "No response generated.";
  const tokensUsed = data.usage?.total_tokens || 0;
  return { text, tokensUsed };
}
