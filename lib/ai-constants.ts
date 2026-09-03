// lib/ai-constants.ts - Universal AI Types & Provider Presets

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  provider: string;
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
  gemini_web2api: {
    name: "Gemini Web2API (Local Server :8081)",
    baseUrl: "http://localhost:8081/v1",
    defaultModel: "gemini-3.6-flash",
    placeholderKey: "sk-gemini",
  },
  gemini_web: {
    name: "Gemini Web (Free Cookie Auth)",
    baseUrl: "https://gemini.google.com",
    defaultModel: "gemini-web",
    placeholderKey: "__Secure-1PSID=...; __Secure-1PSIDTS=...;",
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
