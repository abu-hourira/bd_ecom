// components/storefront/CustomerAiWidget.tsx
"use client";

import { useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFeatures } from "@/context/FeatureFlagContext";

export default function CustomerAiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "ai",
      text: "👋 আসসালামু আলাইকুম! আমি এনমারের অর্গানিক খাদ্য সহকারী। সুন্দরবনের খাঁটি মধু, সরিষার তেল, ডেলিভারি ও পুষ্টি বিষয়ক যে কোনো প্রশ্ন করতে পারেন!",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { t, locale } = useLanguage();
  const { isFeatureEnabled } = useFeatures();
  if (!isFeatureEnabled("customer_ai_widget")) return null;

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || sending) return;

    const userMsg = { sender: "user" as const, text: query };
    const historyPayload = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/storefront/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          sessionId: "web-user",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, { sender: "ai" as const, text: json.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai" as const, text: json.reply || "দুঃখিত, উত্তর পাওয়া যায়নি।" },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "দুঃখিত, সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে সরাসরি আমাদের সাথে হোয়াটসঅ্যাপে (+৮৮০ ১৬১৪ ১১৩০৮২) যোগাযোগ করুন।",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest text-white shadow-floating hover:bg-forest-deep transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open Organic AI Chat"
        >
          <Bot className="w-5 h-5 text-accent animate-bounce" />
          <span className="text-xs font-bold font-display tracking-wide">
            {t("nav.brandSub")}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 h-[520px] max-h-[85vh] bg-paper rounded-3xl border border-line shadow-floating flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Top Bar */}
          <div className="p-4 bg-forest text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent text-forest-deep flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold font-display text-sm leading-tight">
                  ENMAR AI Assistant
                </h4>
                <span className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  100% Genuine AI Advisor
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-bg">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-forest text-white rounded-br-none shadow-xs font-medium"
                      : "bg-paper border border-line text-ink rounded-bl-none shadow-xs whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-paper border border-line rounded-2xl p-3 text-xs text-ink-soft flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-forest" />
                  <span>AI চিন্তা করছে...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-paper border-t border-line flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSend("মধুর বিশুদ্ধতা কীভাবে যাচাই করবেন?")}
              className="px-2.5 py-1 rounded-full bg-bg hover:bg-forest-soft border border-line text-ink-soft hover:text-forest whitespace-nowrap transition-colors cursor-pointer"
            >
              🍯 খাঁটি মধুর পরীক্ষা
            </button>
            <button
              type="button"
              onClick={() => handleSend("ঢাকার ভেতরে ডেলিভারি চার্জ কত?")}
              className="px-2.5 py-1 rounded-full bg-bg hover:bg-forest-soft border border-line text-ink-soft hover:text-forest whitespace-nowrap transition-colors cursor-pointer"
            >
              🚚 ডেলিভারি চার্জ
            </button>
          </div>

          {/* Bottom Input */}
          <div className="p-3 bg-paper border-t border-line flex items-center gap-2">
            <input
              type="text"
              placeholder="খাদ্য বা অর্ডার সম্পর্কে যে কোনো প্রশ্ন লিখুন..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-xl bg-forest text-white hover:bg-forest-deep disabled:opacity-40 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
