"use client";
// components/storefront/CustomerAiWidget.tsx - Advanced Organic AI Customer Assistant (Text-Based)

import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  Loader2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFeatures } from "@/context/FeatureFlagContext";
import MarkdownText from "@/components/ui/MarkdownText";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function CustomerAiWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useLanguage();
  const { isFeatureEnabled } = useFeatures();

  const DEFAULT_MESSAGE: ChatMessage = {
    id: "welcome-1",
    sender: "ai",
    text:
      locale === "bn"
        ? "🌿 **আসসালামু আলাইকুম!** আমি **ENMAR অর্গানিক ফুড বিশেষজ্ঞ এআই সহকারী**।\n\nসুন্দরবনের কাঁচা মধু, কাঠের ঘানিভাঙা খাঁটি সরিষার তেল, গাওয়া ঘি, প্রিমিয়াম খেজুর বা আপনার সুস্থতার উপযোগী অর্গানিক পণ্য সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।\n\n📦 আপনার কোনো রানিং অর্ডার থাকলে ট্র্যাকিং আইডিসহ লিখুন, আমি তৎক্ষণাৎ স্ট্যাটাস জানিয়ে দেব!"
        : "🌿 **Hello!** I am your **ENMAR Organic Food Expert AI Advisor**.\n\nAsk me anything about Sundarban raw honey, wood-pressed cold mustard oil, gawa ghee, organic dates, or healthy living diets.\n\n📦 If you have an active order, simply mention your Tracking ID for real-time status!",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_MESSAGE]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("enmar_customer_ai_chat_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // Save chat history to localStorage
  const updateMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem("enmar_customer_ai_chat_v2", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, sending, open]);

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearChat = () => {
    updateMessages(() => [DEFAULT_MESSAGE]);
  };

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const historyPayload = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    updateMessages((prev) => [...prev, userMsg]);
    if (!text) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/storefront/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          history: historyPayload,
          sessionId: "web-user",
        }),
      });
      const json = await res.json();
      if (json.success && json.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: json.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        updateMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text:
            json.reply ||
            (locale === "bn"
              ? "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। জরুরি তথ্যের জন্য আমাদের হোয়াটসঅ্যাপে (+৮৮০ ১৬১৪ ১১৩০৮২) যোগাযোগ করুন।"
              : "Sorry, I am unable to reply at this moment. Please reach out via WhatsApp at +880 1614 113082."),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        updateMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const connErrorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text:
          locale === "bn"
            ? "দুঃখিত, এআই সার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে। সরাসরি কথা বলতে আমাদের হোয়াটসঅ্যাপে (+৮৮০ ১৬১৪ ১১৩০৮২) বার্তা দিন।"
            : "Sorry, connection is momentarily delayed. For instant assistance, message us on WhatsApp (+880 1614 113082).",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      updateMessages((prev) => [...prev, connErrorMsg]);
    } finally {
      setSending(false);
    }
  };

  if (!isFeatureEnabled("customer_ai_widget")) return null;

  return (
    <>
      {/* Floating Trigger Button (Compact, Non-Intrusive Circle) */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 left-3.5 sm:bottom-6 sm:left-6 z-40 p-2.5 sm:p-3 rounded-full bg-forest hover:bg-forest-deep text-white shadow-xl border-2 border-amber-400/50 transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer flex items-center gap-1.5"
          aria-label="Open Organic AI Chat"
          title={locale === "bn" ? "অর্গানিক এআই বিশেষজ্ঞের সাথে চ্যাট করুন" : "Chat with ENMAR AI Assistant"}
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="hidden md:inline text-xs font-bold font-display text-amber-300 pr-1">
            {locale === "bn" ? "এআই সহকারী" : "AI Advisor"}
          </span>
        </button>
      )}

      {/* Expanded Modern Chat Window */}
      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 sm:w-[410px] w-auto h-[560px] max-h-[85vh] bg-paper rounded-3xl border border-line shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Top Header */}
          <div className="p-4 bg-forest text-white flex items-center justify-between shadow-xs border-b border-amber-400/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-ink flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-6 h-6 text-stone-900" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-forest" />
              </div>
              <div>
                <h4 className="font-bold font-display text-sm leading-tight text-white flex items-center gap-1.5">
                  <span>ENMAR AI Advisor</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <span className="text-[10px] text-emerald-200 flex items-center gap-1 font-medium">
                  {locale === "bn" ? "খাঁটি অর্গানিক খাদ্যের বিশেষজ্ঞ" : "Pure Organic Food Expert"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset / Clear */}
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 rounded-xl text-stone-300 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
                title={locale === "bn" ? "নতুন চ্যাট শুরু করুন" : "Reset conversation"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-3xl p-3.5 text-xs leading-relaxed transition-all shadow-xs ${
                    m.sender === "user"
                      ? "bg-forest text-white rounded-br-xs font-medium"
                      : "bg-paper border border-line text-ink rounded-bl-xs"
                  }`}
                >
                  {m.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <MarkdownText content={m.text} className="text-ink" />
                  )}
                </div>

                {/* Message Meta & Action Bar */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-ink-soft">
                  <span className="font-mono">{m.timestamp}</span>
                  {m.sender === "ai" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.text)}
                      className="hover:text-forest transition-colors cursor-pointer p-0.5 rounded flex items-center gap-1"
                      title="Copy text"
                    >
                      {copiedId === m.id ? (
                        <span className="text-emerald-600 flex items-center gap-0.5 font-semibold">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex flex-col items-start space-y-1">
                <div className="bg-paper border border-line rounded-3xl rounded-bl-xs p-3.5 text-xs text-ink-soft flex items-center gap-2.5 shadow-xs animate-pulse">
                  <div className="w-6 h-6 rounded-xl bg-forest-soft text-forest flex items-center justify-center font-bold">
                    <Bot className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-forest">
                    <span>{locale === "bn" ? "এআই উত্তর তৈরি করছে" : "AI is thinking"}</span>
                    <span className="animate-ping">...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Smart Suggestion Chips */}
          <div className="px-3 py-2 bg-paper border-t border-line flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() =>
                handleSend(
                  locale === "bn"
                    ? "সুন্দরবনের কাঁচা মধুর উপকারিতা ও খাঁটি চেনার উপায় কী?"
                    : "What are the benefits of Sundarban raw honey and how to test its purity?"
                )
              }
              className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              🍯 {locale === "bn" ? "খাঁটি মধু" : "Raw Honey"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSend(
                  locale === "bn"
                    ? "কাঠের ঘানিভাঙা খাঁটি সরিষার তেলের দাম ও বিশেষত্ব কী?"
                    : "What is special about cold wood-pressed mustard oil?"
                )
              }
              className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              🌿 {locale === "bn" ? "ঘানিভাঙা তেল" : "Mustard Oil"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSend(
                  locale === "bn"
                    ? "ফ্রি ডেলিভারি পেতে কত টাকার অর্ডার করতে হবে এবং ডেলিভারি চার্জ কত?"
                    : "What are your delivery charges and free shipping threshold?"
                )
              }
              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              🚚 {locale === "bn" ? "ডেলিভারি চার্জ" : "Delivery"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSend(
                  locale === "bn"
                    ? "আমার অর্ডারের বর্তমান অবস্থা জানতে চাই।"
                    : "I want to track my order status."
                )
              }
              className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              📦 {locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Track Order"}
            </button>
          </div>

          {/* Input Controls */}
          <div className="p-3 bg-paper border-t border-line flex items-center gap-2">
            <input
              type="text"
              placeholder={
                locale === "bn"
                  ? "মধু, তেল, ঘি বা অর্ডারের প্রশ্ন লিখুন..."
                  : "Ask about honey, ghee, mustard oil, orders..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-bg border border-line text-xs text-ink focus:outline-none focus:border-forest font-medium placeholder:text-ink-soft"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-2xl bg-forest text-white hover:bg-forest-deep disabled:opacity-40 transition-all shadow-premium cursor-pointer active:scale-95"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
