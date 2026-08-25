"use client";
// app/admin/ai/page.tsx

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
  AlertTriangle,
  Activity,
  RotateCcw,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import AlertModal from "@/components/ui/AlertModal";

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
  const [monthlyLimit, setMonthlyLimit] = useState(1000);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quota status state
  const [quotaStatus, setQuotaStatus] = useState<{
    isExhausted: boolean;
    errorMsg: string;
    requestsCount: number;
    limit: number;
    percentage: number;
  }>({
    isExhausted: false,
    errorMsg: "",
    requestsCount: 0,
    limit: 1000,
    percentage: 0,
  });

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchAiData = () => {
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
        if (json.quotaStatus) {
          setQuotaStatus(json.quotaStatus);
          if (json.quotaStatus.limit) setMonthlyLimit(json.quotaStatus.limit);
        }
      });
  };

  useEffect(() => {
    fetchAiData();
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
        fetchAiData();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai" as const,
            text: json.reply || "⚠️ AI Assistant is currently in fallback mode.",
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
          monthlyLimit,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        if (apiKey) setHasApiKey(true);
        setApiKey("");
        fetchAiData();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetQuota = async () => {
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_quota" }),
      });
      const json = await res.json();
      if (json.success) {
        setAlertState({
          isOpen: true,
          title: "Quota Alert Cleared",
          message: "AI Quota status has been reset. The AI Agent is back to active status.",
          type: "success",
        });
        fetchAiData();
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8 lg:ml-64">
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
              AI Gateway & Quota Settings
            </button>
          </div>
        </div>

        {/* Quota Exhaustion Alert Banner */}
        {quotaStatus.isExhausted && (
          <div className="bg-rose-50 border border-rose-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                  <span>AI Agent Limit / Quota Exhausted (এআই লিমিট শেষ)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-200 text-rose-800 font-mono">Status: Offline</span>
                </h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  {quotaStatus.errorMsg || "Your API provider quota or monthly request limit has been reached. Update your API Key or reset below."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetQuota}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Clear Alert</span>
            </button>
          </div>
        )}

        {/* Tab 1: Operations Assistant */}
        {activeTab === "assistant" && (
          <div className="space-y-6">
            {/* Quick Action Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleSendMessage("Analyze my low stock products and suggest restock priority.")}
                className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-medium text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Restock Velocity Check</span>
              </button>
              <button
                onClick={() => handleSendMessage("Write an exciting 2-sentence marketing slogan for an Eid Organic Honey sale in Bengali.")}
                className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-medium text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Eid Sale Copy (Bengali)</span>
              </button>
              <button
                onClick={() => handleSendMessage("Summarize today's order statistics and customer breakdown.")}
                className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-medium text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Store Orders Summary</span>
              </button>
            </div>

            {/* Chat Box Container */}
            <div className="bg-paper rounded-3xl border border-line shadow-card flex flex-col h-[520px] overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.sender === "ai" && (
                      <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 text-xs font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        m.sender === "user"
                          ? "bg-forest text-white rounded-br-none"
                          : "bg-bg border border-line text-ink rounded-bl-none shadow-xs whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                      <span
                        className={`block text-[10px] mt-1.5 ${
                          m.sender === "user" ? "text-white/60 text-right" : "text-ink-soft"
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex items-center gap-2 text-ink-soft text-xs italic">
                    <Loader2 className="w-4 h-4 animate-spin text-forest" />
                    <span>ENMAR AI is analyzing store data and drafting response...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-bg border-t border-line">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask the AI agent to draft descriptions, summarize orders, or write copy..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-paper border border-line text-sm focus:outline-none focus:border-forest"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="px-5 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-premium transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Gateway & Quota Settings */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form */}
            <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
              <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
                <h3 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-forest" />
                  <span>AI Model & Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                      AI Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProvider(val);
                        if (val === "openai") setModelName("gpt-4o");
                        else if (val === "gemini") setModelName("gemini-3.6-flash");
                        else if (val === "anthropic") setModelName("claude-3-5-sonnet-20241022");
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-semibold text-ink focus:outline-none focus:border-forest"
                    >
                      <option value="openai">OpenAI (ChatGPT / GPT-4o)</option>
                      <option value="gemini">Google Gemini (Gemini 3.6 Flash)</option>
                      <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
                      <option value="groq">Groq (Ultra-Fast Llama 3)</option>
                      <option value="openrouter">OpenRouter (Multi-Model Gateway)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g. gpt-4o, gemini-3.6-flash"
                      className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>API Key (Stored with AES-256 Encryption at Rest)</span>
                    {hasApiKey && (
                      <span className="text-emerald-700 font-normal text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Key is configured & active
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={hasApiKey ? "•••••••••••••••••••••••• (Leave blank to keep existing key)" : "Enter API Key (sk-... or AIza...)"}
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                    Monthly Request Safety Limit
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                      placeholder="1000"
                      className="w-48 px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                    />
                    <span className="text-xs text-ink-soft">requests/month (0 for unlimited)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                    Customer Storefront AI System Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Instructions for the customer-facing chat assistant..."
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs text-ink focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-line">
                  <div>
                    <span className="font-bold text-xs text-ink block">Enable Storefront Customer AI</span>
                    <span className="text-[11px] text-ink-soft">
                      Allow customers to chat with the AI assistant on the website for product questions.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-line">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Settings saved & verified successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="ml-auto px-6 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Save AI Configuration</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Right 1 Col: Live Quota & Usage Monitor Card */}
            <div className="space-y-6">
              <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold font-display text-ink text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-forest" />
                    <span>AI Quota & Usage</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    quotaStatus.isExhausted
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}>
                    {quotaStatus.isExhausted ? "Quota Exhausted" : "Active & Healthy"}
                  </span>
                </div>

                {/* Progress Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ink-soft">Monthly Requests Used</span>
                    <span className="text-ink font-mono">{quotaStatus.requestsCount} / {quotaStatus.limit}</span>
                  </div>
                  <div className="w-full h-3 bg-bg rounded-full overflow-hidden border border-line">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quotaStatus.percentage >= 100
                          ? "bg-rose-600"
                          : quotaStatus.percentage >= 80
                          ? "bg-amber-500"
                          : "bg-forest"
                      }`}
                      style={{ width: `${quotaStatus.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-ink-soft">
                    <span>{quotaStatus.percentage}% Consumed</span>
                    <span>{Math.max(0, quotaStatus.limit - quotaStatus.requestsCount)} remaining</span>
                  </div>
                </div>

                {/* Quota details */}
                <div className="p-3.5 rounded-2xl bg-bg border border-line text-xs space-y-1.5">
                  <span className="font-bold text-ink block text-[11px] uppercase tracking-wider">Quota Guardrails</span>
                  <p className="text-ink-soft text-[11px] leading-relaxed">
                    When the quota limit is reached or the API provider returns 429 Insufficient Credits, an alert is automatically flagged in the admin panel and the customer chat switches to offline contact mode.
                  </p>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleResetQuota}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Quota Alert Status</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type || "info"}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
