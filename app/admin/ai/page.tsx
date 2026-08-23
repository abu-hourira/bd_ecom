// app/admin/ai/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Sliders,
  ShieldCheck,
  Key,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminAiPage() {
  const [activeTab, setActiveTab] = useState<"assistant" | "settings">("assistant");

  // Chat State
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; time: string }>
  >([
    {
      sender: "ai",
      text: "🌿 **Hello Abu Hourira!** I am your internal ENMAR AI operations assistant. Ask me to draft product copy, analyze low-stock inventory, or generate promotional slogans.",
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Settings State
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gpt-4o");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [adminPrompt, setAdminPrompt] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.setting) {
          const s = json.setting;
          setProvider(s.provider || "openai");
          setModelName(s.modelName || "gpt-4o");
          setSystemPrompt(s.systemPrompt || "");
          setAdminPrompt(s.adminPrompt || "");
          setIsActive(Boolean(s.isActive));
          setHasApiKey(Boolean(s.hasApiKey));
        }
      });
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || sending) return;

    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai" as const,
            text: json.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          modelName,
          systemPrompt,
          adminPrompt,
          isActive,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        if (apiKey) setHasApiKey(true);
        setApiKey("");
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4 text-accent" />
              <span>AI Operations & Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-ink">
              Admin AI Automation Agent
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Accelerate daily store operations: draft SEO descriptions, restock velocity alerts, and promo copy.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-paper border border-line shadow-xs">
            <button
              onClick={() => setActiveTab("assistant")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "assistant"
                  ? "bg-forest text-white shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Operations Assistant
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-forest text-white shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              AI Gateway Settings
            </button>
          </div>
        </div>

        {/* Tab 1: Operations Assistant */}
        {activeTab === "assistant" && (
          <div className="space-y-6">
            {/* Quick Action Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() =>
                  handleSendMessage("Check current low stock inventory and recommend restock quantities.")
                }
                className="px-3.5 py-1.5 rounded-full bg-paper hover:bg-forest-soft hover:text-forest border border-line text-xs font-semibold text-ink whitespace-nowrap shadow-xs transition-all"
              >
                📦 Check Low-Stock Alerts
              </button>
              <button
                onClick={() =>
                  handleSendMessage("Draft an organic SEO product description and benefit highlights for Sundarban Raw Honey.")
                }
                className="px-3.5 py-1.5 rounded-full bg-paper hover:bg-forest-soft hover:text-forest border border-line text-xs font-semibold text-ink whitespace-nowrap shadow-xs transition-all"
              >
                ✨ Draft Honey Description
              </button>
              <button
                onClick={() =>
                  handleSendMessage("Propose 3 promotional campaign slogans and announcement bar copy for an upcoming Eid sale.")
                }
                className="px-3.5 py-1.5 rounded-full bg-paper hover:bg-forest-soft hover:text-forest border border-line text-xs font-semibold text-ink whitespace-nowrap shadow-xs transition-all"
              >
                🎉 Generate Eid Sale Slogans
              </button>
            </div>

            {/* Chat Console */}
            <div className="bg-paper rounded-3xl border border-line shadow-card flex flex-col h-[560px] overflow-hidden">
              <div className="p-4 border-b border-line bg-forest-deep text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent text-forest-deep font-bold flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs">ENMAR Store Intelligence Assistant</h3>
                    <span className="text-[10px] text-white/70 block">
                      Read/Suggest Mode • Writes require admin confirmation
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-forest text-white rounded-br-none shadow-xs"
                          : "bg-paper border border-line text-ink rounded-bl-none shadow-card whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-ink-soft mt-1 px-1">{m.time}</span>
                  </div>
                ))}
                {sending && (
                  <div className="flex items-center gap-2 text-xs text-forest font-semibold p-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing store metrics & generating draft...</span>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 border-t border-line bg-paper flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Ask to draft product descriptions, analyze sales trends, or write promo copy..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-bg border border-line text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-6 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-forest" />
                    <span>AI Provider Credentials</span>
                  </h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Credentials are AES-256 encrypted at rest and never exposed to client browsers.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-ink">Enable Storefront Bot</span>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-forest rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">AI Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-semibold"
                  >
                    <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                    <option value="gemini">Google Gemini (Gemini 1.5 Pro / Flash)</option>
                    <option value="deepseek">DeepSeek (DeepSeek V3 / R1)</option>
                    <option value="groq">Groq Llama 3 (Ultra-Fast)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Model Name</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
                    placeholder="e.g. gpt-4o"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    API Key {hasApiKey && <span className="text-emerald-600 font-bold ml-1">✓ (Key Configured & Encrypted)</span>}
                  </label>
                  <input
                    type="password"
                    placeholder={hasApiKey ? "•••••••••••••••• (Leave blank to keep existing key)" : "sk-..."}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Customer Support System Prompt (Storefront)
                  </label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Admin Assistant System Prompt (Internal Operations)
                  </label>
                  <textarea
                    rows={3}
                    value={adminPrompt}
                    onChange={(e) => setAdminPrompt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs leading-relaxed"
                  />
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Configuration saved securely with AES-256 encryption!</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-line">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium flex items-center gap-2 disabled:opacity-50"
                >
                  {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save AI Configuration</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
