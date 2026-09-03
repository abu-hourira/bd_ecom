"use client";
// app/admin/ai/page.tsx - Universal Multi-Provider AI Operations & Gateway Management

import { useEffect, useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Sliders,
  ShieldCheck,
  Key,
  Globe,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
  AlertTriangle,
  Activity,
  RotateCcw,
  Trash2,
  Cpu,
  Terminal,
  HelpCircle,
  Cookie,
  Plus,
  Trash,
  FileText,
  Edit,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import AlertModal from "@/components/ui/AlertModal";
import { AI_PROVIDER_DEFAULTS } from "@/lib/ai-constants";
import MarkdownText from "@/components/ui/MarkdownText";

export interface CookieAccountItem {
  id: string;
  fileName: string;
  name: string;
  sizeBytes: number;
  modifiedAt: string;
  hasPsid: boolean;
  hasPsidts: boolean;
  preview: string;
}

export interface AILogItem {
  id: number;
  sessionId: string;
  provider?: string;
  modelName?: string;
  latencyMs?: number;
  source?: string;
  userMessage: string;
  aiResponse: string;
  tokensUsed: number;
  createdAt: string;
}

export default function AdminAiPage() {
  const [activeTab, setActiveTab] = useState<"assistant" | "settings" | "cookies" | "logs">("assistant");

  // Chat State
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; time: string }>
  >([
    {
      sender: "ai",
      text: "🌿 **Hello!** I am your internal **ENMAR AI Operations Assistant**.\n\nAsk me to:\n- 📝 Draft product descriptions & SEO meta text\n- 📦 Check inventory velocity and low-stock items\n- 📈 Summarize sales and top-performing categories\n- 📢 Create marketing copy for social ads or banners\n\n*Type below or click any of the quick action pills to start!*",
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechActiveIdx, setSpeechActiveIdx] = useState<number | null>(null);

  // Cookie Pool State
  const [cookieAccounts, setCookieAccounts] = useState<CookieAccountItem[]>([]);
  const [loadingCookies, setLoadingCookies] = useState(false);
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [cookieForm, setCookieForm] = useState<{ fileName?: string; accountName: string; rawCookie: string }>({
    accountName: "",
    rawCookie: "",
  });
  const [savingCookie, setSavingCookie] = useState(false);
  const [deletingCookieName, setDeletingCookieName] = useState<string | null>(null);
  const [testingPool, setTestingPool] = useState(false);

  // AI Telemetry Logs State
  const [aiLogs, setAiLogs] = useState<AILogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSourceFilter, setLogSourceFilter] = useState<"ALL" | "STOREFRONT" | "ADMIN">("ALL");
  const [clearingLogs, setClearingLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  // Settings State
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [modelName, setModelName] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [adminPrompt, setAdminPrompt] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(1000);
  const [autoResetOnLimit, setAutoResetOnLimit] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Quota status state
  const [quotaStatus, setQuotaStatus] = useState<{
    isExhausted: boolean;
    errorMsg: string;
    requestsCount: number;
    limit: number;
    autoReset?: boolean;
    percentage: number;
  }>({
    isExhausted: false,
    errorMsg: "",
    requestsCount: 0,
    limit: 1000,
    autoReset: true,
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
          setBaseUrl(s.baseUrl || AI_PROVIDER_DEFAULTS[s.provider]?.baseUrl || "");
          setModelName(s.modelName || AI_PROVIDER_DEFAULTS[s.provider]?.defaultModel || "gpt-4o");
          setTemperature(s.temperature ?? 0.7);
          setMaxTokens(s.maxTokens ?? 1000);
          setSystemPrompt(s.systemPrompt || "");
          setAdminPrompt(s.adminPrompt || "");
          setIsActive(Boolean(s.isActive));
          setHasApiKey(Boolean(s.hasApiKey));
        }
        if (json.quotaStatus) {
          setQuotaStatus(json.quotaStatus);
          if (json.quotaStatus.limit) setMonthlyLimit(json.quotaStatus.limit);
          if (json.quotaStatus.autoReset !== undefined) setAutoResetOnLimit(Boolean(json.quotaStatus.autoReset));
        }
      });
  };

  useEffect(() => {
    fetchAiData();
  }, []);

  const handleProviderSelect = (selectedProvider: string) => {
    setProvider(selectedProvider);
    const defaults = AI_PROVIDER_DEFAULTS[selectedProvider] || AI_PROVIDER_DEFAULTS.custom;
    setBaseUrl(defaults.baseUrl);
    setModelName(defaults.defaultModel);
  };

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

  const handleCopyAdmin = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeakAdmin = (idx: number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speechActiveIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeechActiveIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`\[\]]/g, "").replace(/\(https?:\/\/[^\)]+\)/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "bn-BD";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeechActiveIdx(null);
    utterance.onerror = () => setSpeechActiveIdx(null);
    setSpeechActiveIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const toggleAdminSpeech = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const recog = new SpeechRecognition();
        recog.lang = "bn-BD";
        recog.onresult = (e: any) => {
          const trans = e.results[0][0].transcript;
          if (trans) {
            setInputMessage((prev) => (prev ? `${prev} ${trans}` : trans));
          }
          setIsListening(false);
        };
        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);
        recog.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
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
          baseUrl,
          modelName,
          temperature,
          maxTokens,
          systemPrompt,
          adminPrompt,
          isActive,
          monthlyLimit,
          autoResetOnLimit,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        if (apiKey) setHasApiKey(true);
        setApiKey("");
        fetchAiData();
        setAlertState({
          isOpen: true,
          title: "AI Settings Saved",
          message: `Your AI agent configuration for ${provider.toUpperCase()} (${modelName}) has been securely saved and tested!`,
          type: "success",
        });
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setAlertState({
          isOpen: true,
          title: "Save Failed",
          message: json.error || "Failed to update AI settings.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
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

  const handleResetCounter = async () => {
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_counter" }),
      });
      const json = await res.json();
      if (json.success) {
        setAlertState({
          isOpen: true,
          title: "Request Counter Reset",
          message: "Monthly AI request usage counter has been reset back to 0.",
          type: "success",
        });
        fetchAiData();
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    }
  };

  const handleDeleteConfig = async () => {
    setDeletingConfig(true);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setHasApiKey(false);
        setApiKey("");
        setIsActive(false);
        setShowDeleteConfirm(false);
        setAlertState({
          isOpen: true,
          title: "AI Configuration Deleted",
          message: "All AI keys and custom settings have been erased safely.",
          type: "success",
        });
        fetchAiData();
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    } finally {
      setDeletingConfig(false);
    }
  };

  const fetchCookieAccounts = async () => {
    setLoadingCookies(true);
    try {
      const res = await fetch("/api/admin/ai/cookies");
      const json = await res.json();
      if (json.success && json.accounts) {
        setCookieAccounts(json.accounts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCookies(false);
    }
  };

  useEffect(() => {
    fetchCookieAccounts();
  }, []);

  const handleSaveCookie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookieForm.rawCookie.trim()) {
      setAlertState({
        isOpen: true,
        title: "Validation Error",
        message: "Please paste your cookie string or JSON content.",
        type: "error",
      });
      return;
    }

    setSavingCookie(true);
    try {
      const res = await fetch("/api/admin/ai/cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cookieForm),
      });
      const json = await res.json();
      if (json.success) {
        setCookieModalOpen(false);
        setCookieForm({ accountName: "", rawCookie: "" });
        setAlertState({
          isOpen: true,
          title: "Cookie Account Saved",
          message: json.message || "Cookie account added to rotation pool successfully!",
          type: "success",
        });
        fetchCookieAccounts();
      } else {
        setAlertState({
          isOpen: true,
          title: "Failed to Save Cookie",
          message: json.error || "Could not save cookie account.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    } finally {
      setSavingCookie(false);
    }
  };

  const handleDeleteCookie = async (fileName: string) => {
    try {
      const res = await fetch(`/api/admin/ai/cookies?fileName=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setDeletingCookieName(null);
        setAlertState({
          isOpen: true,
          title: "Account Deleted",
          message: json.message || "Cookie account removed from pool.",
          type: "success",
        });
        fetchCookieAccounts();
      } else {
        setAlertState({ isOpen: true, title: "Error", message: json.error, type: "error" });
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    }
  };

  const handleTestCookiePool = async () => {
    setTestingPool(true);
    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Test connection: respond with 'OK 200'" }),
      });
      const json = await res.json();
      if (json.success) {
        setAlertState({
          isOpen: true,
          title: "Cookie Pool Active & Healthy!",
          message: `Live response received from Gemini: "${json.reply?.slice(0, 120)}..."`,
          type: "success",
        });
      } else {
        setAlertState({
          isOpen: true,
          title: "Connection Failed",
          message: json.reply || "Could not reach Gemini with current cookies.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    } finally {
      setTestingPool(false);
    }
  };

  const fetchAiLogs = async (source = logSourceFilter) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/ai/logs?source=${source}`);
      const json = await res.json();
      if (json.success && json.logs) {
        setAiLogs(json.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    setClearingLogs(true);
    try {
      const res = await fetch("/api/admin/ai/logs", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setAiLogs([]);
        setAlertState({
          isOpen: true,
          title: "Logs Cleared",
          message: "All AI telemetry logs have been cleared.",
          type: "success",
        });
      }
    } catch (e: any) {
      setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
    } finally {
      setClearingLogs(false);
    }
  };

  const activeProviderInfo = AI_PROVIDER_DEFAULTS[provider] || AI_PROVIDER_DEFAULTS.custom;

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-forest text-white flex items-center justify-center text-lg shadow-sm">
              <Bot className="w-6 h-6" />
            </span>
            <span>Universal AI Agent Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Configure ANY AI Provider (OpenAI, Gemini, Claude, DeepSeek, Groq, OpenRouter, Mistral, Ollama, Custom URL) to automate store operations & customer support.
          </p>
        </div>

        {/* Top Tab Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-bg p-1.5 rounded-2xl border border-line">
          <button
            onClick={() => setActiveTab("assistant")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "assistant"
                ? "bg-forest text-white shadow-xs"
                : "text-ink hover:text-forest"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Operations Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-forest text-white shadow-xs"
                : "text-ink hover:text-forest"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Gateway & API Settings</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("cookies");
              fetchCookieAccounts();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "cookies"
                ? "bg-forest text-white shadow-xs"
                : "text-ink hover:text-forest"
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-amber-500" />
            <span>Gemini Cookie Accounts</span>
            {cookieAccounts.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "cookies" ? "bg-white/20 text-white" : "bg-forest-soft text-forest"
              }`}>
                {cookieAccounts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              fetchAiLogs();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "logs"
                ? "bg-forest text-white shadow-xs"
                : "text-ink hover:text-forest"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Live Telemetry & Audit Logs</span>
            {aiLogs.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "logs" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
              }`}>
                {aiLogs.length}
              </span>
            )}
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
                <span>AI Agent Limit / Quota Exhausted</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-200 text-rose-800 font-mono">Status: Offline</span>
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                {quotaStatus.errorMsg || "Your API provider quota or monthly limit has been reached. Update your API Key or reset below."}
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
          {/* Top Chat Subheader with Active Model & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-paper p-4 rounded-3xl border border-line shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-forest text-white flex items-center gap-1.5 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
                <span>Active: {provider === "gemini_web2api" ? "Gemini Web2API (Cookie Pool)" : provider.toUpperCase()}</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-mono bg-forest-soft text-forest border border-forest/20">
                {modelName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      sender: "ai",
                      text: "🌿 **Hello!** I am your internal **ENMAR AI Operations Assistant**.\n\nAsk me anything about products, low-stock inventory, revenue trends, or promotional marketing.",
                      time: "Just now",
                    },
                  ])
                }
                className="px-3 py-1.5 rounded-xl border border-line bg-bg hover:bg-line text-xs font-bold text-ink-soft hover:text-ink transition-all flex items-center gap-1.5 cursor-pointer"
                title="Clear chat history"
              >
                <RotateCcw className="w-3 h-3 text-forest" />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>

          {/* Quick Action Prompt Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleSendMessage("Analyze my low stock products and suggest restock priority.")}
              className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-bold text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>📦 Restock Priority Check</span>
            </button>
            <button
              onClick={() => handleSendMessage("সুন্দরবনের কাঁচা মধুর জন্য একটি আকর্ষণীয় ফেসবুক অ্যাড কপি বাংলায় তৈরি করো।")}
              className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-bold text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>🍯 মধুর ফেসবুক অ্যাড কপি</span>
            </button>
            <button
              onClick={() => handleSendMessage("Summarize today's order statistics, delivery breakdown, and revenue.")}
              className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-bold text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>📊 বিক্রয় ও অর্ডার অ্যানালিটিক্স</span>
            </button>
            <button
              onClick={() => handleSendMessage("কাঠের ঘানিভাঙা খাঁটি সরিষার তেলের বৈশিষ্ট্য ও স্বাস্থ্যোপকারিতা নিয়ে একটি সুন্দর ব্লগ ইন্ট্রো লিখে দাও।")}
              className="px-3.5 py-2 rounded-xl bg-paper border border-line hover:border-forest text-xs font-bold text-ink transition-all shrink-0 hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>🌿 সরিষার তেলের ব্লগ পোস্ট</span>
            </button>
          </div>

          {/* Chat Box Container */}
          <div className="bg-paper rounded-3xl border border-line shadow-card flex flex-col h-[580px] overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-bg/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex gap-3 max-w-2xl">
                    {m.sender === "ai" && (
                      <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        m.sender === "user"
                          ? "bg-forest text-white rounded-br-xs font-medium ml-auto"
                          : "bg-paper border border-line text-ink rounded-bl-xs"
                      }`}
                    >
                      {m.sender === "user" ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <MarkdownText content={m.text} className="text-ink" />
                      )}
                    </div>
                  </div>

                  {/* Meta bar for AI messages */}
                  <div className="flex items-center gap-2 mt-1 px-11 text-[10.5px] text-ink-soft">
                    <span className="font-mono">{m.time}</span>
                    {m.sender === "ai" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakAdmin(idx, m.text)}
                          className={`hover:text-forest transition-colors cursor-pointer p-0.5 rounded ${
                            speechActiveIdx === idx ? "text-forest font-bold" : ""
                          }`}
                          title="Listen / Read aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyAdmin(idx, m.text)}
                          className="hover:text-forest transition-colors cursor-pointer p-0.5 rounded"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-ink-soft text-xs italic bg-paper p-3 rounded-2xl border border-line w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-forest" />
                  <span>ENMAR AI ({provider.toUpperCase()}) is processing and reasoning with store telemetry...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-paper border-t border-line">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input */}
                <button
                  type="button"
                  onClick={toggleAdminSpeech}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                      : "bg-bg border-line text-ink hover:text-forest hover:bg-line"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice typing"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isListening
                      ? "শুনছি... কথা বলুন..."
                      : "Ask the AI agent to draft descriptions, analyze inventory, or summarize orders..."
                  }
                  className="flex-1 px-4 py-3 rounded-2xl bg-bg border border-line text-sm text-ink focus:outline-none focus:border-forest placeholder:text-ink-soft"
                />

                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-5 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-premium transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Universal AI Gateway & API Settings */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
            <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h3 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-forest" />
                  <span>AI Provider & Custom Model Gateway</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-forest-soft text-forest font-mono">
                  Universal Any-AI Engine
                </span>
              </div>

              {/* 1. Quick One-Click Provider Selection Pills */}
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2.5">
                  Select AI Provider Preset (বা আপনার পছন্দমতো কাস্টম প্রোভাইডার নির্বাচন করুন)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(AI_PROVIDER_DEFAULTS).map(([key, def]) => {
                    const isSelected = provider === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleProviderSelect(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-forest bg-forest-soft text-forest shadow-xs font-bold"
                            : "border-line bg-bg hover:border-forest/50 text-ink text-xs font-medium"
                        }`}
                      >
                        <span className="block text-xs truncate">{def.name}</span>
                        <span className="block text-[10px] text-ink-soft truncate font-mono mt-0.5">
                          {def.defaultModel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Endpoint URL & Model Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-forest" />
                      <span>API Base URL (যেকোনো AI API Endpoint)</span>
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      OpenAI, DeepSeek, Groq, Ollama, Localhost, etc.
                    </span>
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1 or https://api.deepseek.com or http://localhost:11434/v1"
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-forest" />
                    <span>Model Identifier / Name</span>
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. gpt-4o, deepseek-chat, llama-3.3-70b-versatile, gemini-2.0-flash"
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>
                      {provider === "gemini_web"
                        ? "Gemini Cookie (__Secure-1PSID)"
                        : "API Key (AES-256 Encrypted)"}
                    </span>
                    {hasApiKey && (
                      <span className="text-emerald-700 font-normal text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {provider === "gemini_web" ? "Cookie Saved" : "Key Saved"}
                      </span>
                    )}
                  </label>
                  <input
                    type={provider === "gemini_web" ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      hasApiKey
                        ? "•••••••••••••••••••••••• (Leave blank to keep saved credential)"
                        : activeProviderInfo.placeholderKey || "Enter your API Key / Cookie"
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                  />
                  {provider === "gemini_web" && (
                    <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 space-y-1">
                      <p className="font-bold flex items-center gap-1 text-blue-800">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>কুকি পাওয়ার সহজ ৩টি ধাপ (How to get Gemini Cookie):</span>
                      </p>
                      <ol className="list-decimal pl-4 space-y-0.5 text-[10.5px] text-blue-950/80">
                        <li>ব্রাউজারে <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700">gemini.google.com</a>-এ লগইন করুন।</li>
                        <li>কিবোর্ডে <strong>F12</strong> (বা Right Click &gt; Inspect) চেপে <strong>Application</strong> ট্যাবে যান (Firefox-এ Storage)।</li>
                        <li>বামে <strong>Cookies &gt; https://gemini.google.com</strong>-এ ক্লিক করে <strong>__Secure-1PSID</strong>-এর মানটি কপি করে এখানে পেস্ট করুন।</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Hyperparameters: Temperature & Max Tokens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-bg border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-forest" />
                      <span>Temperature (Creativity)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-forest">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-forest cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink-soft">
                    <span>Precise (0.0)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-bg border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">
                      Max Output Tokens
                    </label>
                    <span className="text-xs font-mono font-bold text-forest">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="4000"
                    step="250"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-forest cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink-soft">
                    <span>Short (250)</span>
                    <span>Standard (1000)</span>
                    <span>Long (4000)</span>
                  </div>
                </div>
              </div>

              {/* 4. Prompts & Toggles */}
              <div className="space-y-4 pt-2 border-t border-line">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                    Customer Storefront AI System Prompt (Shopper Chatbot)
                  </label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Instructions for how the AI answers customer questions on the storefront..."
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs text-ink focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                    Admin Operations AI System Prompt (Internal Assistant)
                  </label>
                  <textarea
                    rows={3}
                    value={adminPrompt}
                    onChange={(e) => setAdminPrompt(e.target.value)}
                    placeholder="Instructions for internal admin operations assistant..."
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs text-ink focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-line">
                  <div>
                    <span className="font-bold text-xs text-ink block">Enable Storefront Customer AI Widget</span>
                    <span className="text-[11px] text-ink-soft">
                      Allow website visitors to chat with this AI model for product advice and order assistance.
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
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-line">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Configuration saved & active!
                  </span>
                ) : (
                  <div></div>
                )}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="ml-auto px-6 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Save Universal AI Configuration</span>
                </button>
              </div>
            </div>
          </form>

          {/* Right 1 Col: Monitoring, Limits & Reset Card */}
          <div className="space-y-6">
            <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-5">
              <h4 className="text-sm font-bold font-display text-ink flex items-center gap-2">
                <Activity className="w-4 h-4 text-forest" />
                <span>AI Telemetry & Usage Limits</span>
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-soft">Current Provider:</span>
                  <span className="font-bold text-forest uppercase font-mono">{provider}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-soft">Active Model:</span>
                  <span className="font-bold text-ink font-mono text-[11px] truncate max-w-[140px]">{modelName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-soft">API Security:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> AES-256 Vault
                  </span>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="pt-2 border-t border-line space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-ink">Monthly Requests</span>
                  <span className="text-forest font-mono">
                    {quotaStatus.requestsCount} / {monthlyLimit > 0 ? monthlyLimit : "∞"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg overflow-hidden border border-line">
                  <div
                    className={`h-full transition-all duration-500 ${
                      quotaStatus.percentage >= 90
                        ? "bg-rose-500"
                        : quotaStatus.percentage >= 70
                        ? "bg-amber-500"
                        : "bg-forest"
                    }`}
                    style={{ width: `${quotaStatus.percentage}%` }}
                  />
                </div>
              </div>

              {/* Counter Reset & Safety Actions */}
              <div className="pt-3 border-t border-line space-y-2">
                <button
                  type="button"
                  onClick={handleResetCounter}
                  className="w-full py-2.5 px-4 rounded-xl bg-bg hover:bg-line text-ink text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-forest" />
                  <span>Reset Usage Counter to 0</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Erase AI Configuration</span>
                </button>
              </div>
            </div>

            {/* Provider Guide Info Box */}
            <div className="bg-forest-soft/60 p-5 rounded-3xl border border-forest/20 space-y-3">
              <h5 className="text-xs font-bold text-forest flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Any AI Compatibility Guide</span>
              </h5>
              <p className="text-[11px] text-ink-soft leading-relaxed">
                You can connect <strong>ANY</strong> AI service:
              </p>
              <ul className="text-[11px] text-ink-soft space-y-1 list-disc pl-4">
                <li><strong>Cloud APIs:</strong> OpenAI, DeepSeek, Google Gemini, Claude, Groq, OpenRouter, Mistral, xAI.</li>
                <li><strong>Local / Offline:</strong> Ollama (`http://localhost:11434/v1`), LM Studio, vLLM.</li>
                <li><strong>Custom Proxies:</strong> Any custom OpenAI-compatible endpoint URL.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gemini Multi-Account Cookie Pool Manager */}
      {activeTab === "cookies" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Cookie className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold font-display text-ink">
                  Gemini Multi-Account Cookie Pool
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest-soft text-forest font-mono">
                  Round-Robin Auto Rotation
                </span>
              </div>
              <p className="text-xs text-ink-soft">
                এখানে আপনি ১টি, ৫টি, ১০টি বা যতখুশি গুগল অ্যাকাউন্টের কুকি যোগ করতে পারেন। কোনো অ্যাকাউন্টের লিমিট শেষ হলে বা মেয়াদ চলে গেলে সিস্টেম স্বয়ংক্রিয়ভাবে পরবর্তী সচল অ্যাকাউন্ট দিয়ে কাজ চালাবে।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestCookiePool}
                disabled={testingPool || cookieAccounts.length === 0}
                className="px-4 py-2.5 rounded-xl border border-line bg-bg hover:bg-line text-xs font-bold text-ink transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testingPool ? <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                <span>Test Pool Live</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCookieForm({ accountName: `Account ${cookieAccounts.length + 1}`, rawCookie: "" });
                  setCookieModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Cookie Account</span>
              </button>
            </div>
          </div>

          {/* Accounts Grid */}
          {loadingCookies ? (
            <div className="p-12 text-center text-ink-soft flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-forest" />
              <span>Loading cookie accounts...</span>
            </div>
          ) : cookieAccounts.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-line text-center space-y-3 bg-paper">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Cookie className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-ink">No Cookie Accounts Added Yet</h4>
              <p className="text-xs text-ink-soft max-w-md mx-auto">
                Add your first Google Gemini account cookie to enable free unlimited round-robin AI reasoning for your store.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCookieForm({ accountName: "Account 1", rawCookie: "" });
                  setCookieModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Account 1</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cookieAccounts.map((acc, index) => (
                <div
                  key={acc.id}
                  className="bg-paper p-5 rounded-3xl border border-line shadow-card hover:border-forest/50 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-forest-soft text-forest flex items-center justify-center text-xs font-bold font-mono">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink truncate max-w-[150px]">{acc.name}</h4>
                        <p className="text-[10px] text-ink-soft font-mono">{acc.fileName}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  {/* Cookie Preview */}
                  <div className="p-2.5 rounded-xl bg-bg border border-line text-[10.5px] font-mono text-ink-soft break-all line-clamp-2">
                    {acc.preview || "••••••••••••••••••••••••"}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className={`px-2 py-0.5 rounded-md font-mono ${
                      acc.hasPsid ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {acc.hasPsid ? "✓ __Secure-1PSID" : "✗ Missing PSID"}
                    </span>
                    {acc.hasPsidts && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono">
                        ✓ 1PSIDTS
                      </span>
                    )}
                    <span className="text-ink-soft ml-auto text-[10px]">
                      {(acc.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCookieForm({
                          fileName: acc.fileName,
                          accountName: acc.name,
                          rawCookie: "",
                        });
                        setCookieModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-bg hover:bg-line text-ink text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Edit className="w-3 h-3 text-forest" />
                      <span>Update Cookie</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingCookieName(acc.fileName)}
                      className="p-1.5 rounded-lg text-ink-soft hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete account"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Live Telemetry & Audit Logs */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          {/* Header Card with Metrics */}
          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Activity className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold font-display text-ink">
                  Live AI Telemetry & Audit Logs
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 font-mono">
                  Real-time Tracking
                </span>
              </div>
              <p className="text-xs text-ink-soft">
                এখানে আপনি দেখতে পাবেন কোন সময়ে কাস্টমার বা অ্যাডমিন কোন AI মডেল ব্যবহার করেছে, রেসপন্স স্পিড (Latency) কত ছিল এবং কি প্রশ্ন-উত্তর হয়েছে।
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fetchAiLogs(logSourceFilter)}
                disabled={loadingLogs}
                className="px-4 py-2.5 rounded-xl border border-line bg-bg hover:bg-line text-xs font-bold text-ink transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loadingLogs ? "animate-spin" : ""}`} />
                <span>Refresh Logs</span>
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                disabled={clearingLogs || aiLogs.length === 0}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
            </div>
          </div>

          {/* Source Filter Tabs */}
          <div className="flex items-center gap-2">
            {(["ALL", "STOREFRONT", "ADMIN"] as const).map((src) => (
              <button
                key={src}
                onClick={() => {
                  setLogSourceFilter(src);
                  fetchAiLogs(src);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  logSourceFilter === src
                    ? "bg-forest text-white shadow-xs"
                    : "bg-paper border border-line text-ink-soft hover:text-ink hover:border-forest/50"
                }`}
              >
                {src === "ALL" && "All Logs"}
                {src === "STOREFRONT" && "Customer Storefront Chat"}
                {src === "ADMIN" && "Admin Operations Chat"}
              </button>
            ))}
          </div>

          {/* Logs List Table */}
          {loadingLogs ? (
            <div className="p-12 text-center text-ink-soft flex items-center justify-center gap-2 bg-paper rounded-3xl border border-line">
              <Loader2 className="w-5 h-5 animate-spin text-forest" />
              <span>Fetching telemetry logs...</span>
            </div>
          ) : aiLogs.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-line text-center space-y-3 bg-paper">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-ink">No AI Logs Recorded Yet</h4>
              <p className="text-xs text-ink-soft max-w-md mx-auto">
                As customers chat on the storefront or staff interact with the AI assistant, all requests, timestamps, providers, and speeds will be recorded here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-paper p-5 rounded-3xl border border-line shadow-card hover:border-forest/40 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider ${
                        log.source === "STOREFRONT"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-purple-50 text-purple-800 border border-purple-200"
                      }`}>
                        {log.source === "STOREFRONT" ? "🛍️ Customer Chat" : "⚡ Admin Assistant"}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-forest-soft text-forest border border-forest/20">
                        {log.provider || "gemini_web2api"} • {log.modelName || "gemini-3.6-flash"}
                      </span>

                      {log.latencyMs ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-700">
                          ⚡ {(log.latencyMs / 1000).toFixed(2)}s
                        </span>
                      ) : null}

                      {log.tokensUsed ? (
                        <span className="text-[11px] font-mono text-ink-soft">
                          {log.tokensUsed} tokens
                        </span>
                      ) : null}
                    </div>

                    <span className="text-[11px] text-ink-soft font-mono">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>

                  {/* Question / Prompt */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-ink flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                      <span>User Question / Prompt:</span>
                    </p>
                    <p className="text-xs text-ink bg-bg p-3 rounded-2xl border border-line font-medium leading-relaxed">
                      {log.userMessage}
                    </p>
                  </div>

                  {/* AI Response Preview */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-forest flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Answer:</span>
                    </p>
                    <div className="text-xs text-ink-soft bg-forest-soft/30 p-3 rounded-2xl border border-forest/20 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {log.aiResponse}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Cookie Account Modal */}
      {cookieModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl p-6 max-w-lg w-full border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-500" />
                <span>{cookieForm.fileName ? `Update ${cookieForm.fileName}` : "Add New Cookie Account"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCookieModalOpen(false)}
                className="text-ink-soft hover:text-ink text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCookie} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Account Label / Name
                </label>
                <input
                  type="text"
                  value={cookieForm.accountName}
                  onChange={(e) => setCookieForm({ ...cookieForm, accountName: e.target.value })}
                  placeholder="e.g. Account 6, Personal Gmail, Office Account"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-line text-xs text-ink focus:outline-none focus:border-forest font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Paste Cookie String or JSON (Chrome / EditThisCookie / Cookie-Editor)
                </label>
                <textarea
                  rows={5}
                  value={cookieForm.rawCookie}
                  onChange={(e) => setCookieForm({ ...cookieForm, rawCookie: e.target.value })}
                  placeholder="Paste your __Secure-1PSID=... or full cookie string, or Cookie-Editor JSON here..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
                />
                <p className="text-[10.5px] text-ink-soft mt-1">
                  💡 <strong>টিপ:</strong> <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">gemini.google.com</a>-এ লগইন করে F12 চেপে Application &gt; Cookies থেকে <code className="bg-bg px-1 py-0.5 rounded font-mono">__Secure-1PSID</code> কপি করে এখানে পেস্ট করুন।
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setCookieModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-bg border border-line text-xs font-bold text-ink cursor-pointer hover:bg-line"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCookie || !cookieForm.rawCookie.trim()}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingCookie ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Save to Account Pool</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Cookie Confirmation Modal */}
      {deletingCookieName && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl p-6 max-w-sm w-full border border-line shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Delete {deletingCookieName}?</span>
            </h3>
            <p className="text-xs text-ink-soft">
              Are you sure you want to remove this account cookie file from the rotation pool?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCookieName(null)}
                className="px-3.5 py-1.5 rounded-lg bg-bg border border-line text-xs font-bold text-ink hover:bg-line cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCookie(deletingCookieName)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl p-6 max-w-md w-full border border-line shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete AI Configuration?</span>
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              This will permanently erase your stored API keys, custom base URLs, and model settings from the database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-bg border border-line text-xs font-bold text-ink cursor-pointer hover:bg-line"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfig}
                disabled={deletingConfig}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deletingConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
}
