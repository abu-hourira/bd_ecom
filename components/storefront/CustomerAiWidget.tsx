"use client";
// components/storefront/CustomerAiWidget.tsx

import { useState } from "react";
import { Bot, Send, X, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFeatures } from "@/context/FeatureFlagContext";

export default function CustomerAiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "ai",
      text: "আসসালামু আলাইকুম! আমি ENMAR অর্গানিক খাদ্য বিশেষজ্ঞ এআই সহকারী। সুন্দরবনের খাঁটি মধু, কাঠের ঘানিভাঙা তেল, পাহাড়ি মশলা বা আপনার সুস্থতার জন্য যেকোনো পণ্যের তথ্য জানতে আমাকে প্রশ্ন করুন!",
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
          {
            sender: "ai" as const,
            text:
              json.reply ||
              (locale === "bn"
                ? "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন।"
                : "Sorry, I am unable to reply at this moment. Please reach out via WhatsApp."),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            locale === "bn"
              ? "দুঃখিত, এআই সার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে। জরুরি সহায়তার জন্য হোয়াটসঅ্যাপে (+৮৮০১৬১৪১১৩০৮২) যোগাযোগ করতে পারেন।"
              : "Sorry, connection is momentarily delayed. For urgent help, please contact us on WhatsApp (+8801614113082).",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Positioned vertically above WhatsApp) */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-36 md:bottom-22 right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-3 rounded-full bg-[#143520] hover:bg-[#0d2315] text-white shadow-xl border-2 border-amber-400/50 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          aria-label="Open Organic AI Chat"
          title={locale === "bn" ? "অর্গানিক এআই অ্যাসিস্ট্যান্টের সাথে চ্যাট করুন" : "Chat with ENMAR AI Assistant"}
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-bold font-display tracking-wide text-amber-300 pr-1">
            {locale === "bn" ? "এআই সহকারী" : "AI Assistant"}
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 sm:w-[380px] w-auto h-[520px] max-h-[82vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Top Header */}
          <div className="p-4 bg-[#143520] text-white flex items-center justify-between shadow-xs border-b border-amber-400/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <h4 className="font-bold font-display text-sm leading-tight text-white flex items-center gap-1.5">
                  <span>ENMAR AI Advisor</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <span className="text-[10px] text-stone-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {locale === "bn" ? "খাঁটি অর্গানিক খাদ্যের তথ্যদাতা" : "Pure Organic Food Expert"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]">
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
                      ? "bg-[#143520] text-white rounded-br-none shadow-xs font-medium"
                      : "bg-white border border-stone-200 text-stone-900 rounded-bl-none shadow-xs whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl p-3 text-xs text-stone-500 flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-[#143520]" />
                  <span>{locale === "bn" ? "এআই তথ্য যাচাই করছে..." : "AI analyzing catalog..."}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-white border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSend(locale === "bn" ? "সুন্দরবনের মধুর উপকারিতা ও দাম কত?" : "What are the health benefits of raw honey?")}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 border border-stone-200 text-stone-700 hover:text-emerald-800 whitespace-nowrap transition-colors cursor-pointer"
            >
              🍯 {locale === "bn" ? "মধুর উপকারিতা" : "Honey Benefits"}
            </button>
            <button
              type="button"
              onClick={() => handleSend(locale === "bn" ? "ফ্রি ডেলিভারি পেতে কত টাকার অর্ডার করতে হবে?" : "What is the minimum order for free delivery?")}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 border border-stone-200 text-stone-700 hover:text-emerald-800 whitespace-nowrap transition-colors cursor-pointer"
            >
              🚚 {locale === "bn" ? "ডেলিভারি খরচ" : "Delivery Info"}
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              placeholder={locale === "bn" ? "পণ্যের উপকারিতা বা অর্ডার সংক্রান্ত প্রশ্ন লিখুন..." : "Ask about products, honey, oils..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#143520] focus:ring-1 focus:ring-[#143520]"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-xl bg-[#143520] text-white hover:bg-[#0d2315] disabled:opacity-40 transition-all shadow-xs cursor-pointer active:scale-95"
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
