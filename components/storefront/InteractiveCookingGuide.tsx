"use client";
// components/storefront/InteractiveCookingGuide.tsx - Interactive Ready-to-Cook Guide for Frozen Foods

import { useState } from "react";
import Link from "next/link";
import { Clock, Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type CookingMode = "pan" | "steam" | "fry";

export default function InteractiveCookingGuide() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";
  const [activeMode, setActiveMode] = useState<CookingMode>("pan");

  const guideData = {
    pan: {
      title: "তাওয়ায় সেকা — মাত্র ৩০ সেকেন্ড",
      subtitle: "হাতে তৈরি লাল ও সাদা আটার ফ্রোজেন রুটি",
      time: "৩০ সেকেন্ড",
      recommendedFor: "লাল আটার রুটি, সাদা আটার রুটি, পরোটা",
      image: "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
      targetSlug: "handmade-frozen-red-flour-roti-20pcs",
      steps: [
        {
          num: "১",
          heading: "সরাসরি ফ্রিজ থেকে বের করুন",
          text: "রুটি কখনোই বরফ গলাবেন না। সরাসরি গরম তাওয়ায় দিন।",
        },
        {
          num: "২",
          heading: "মাঝারি আঁচে তাওয়ায় সেকুন",
          text: "প্রথমে একপাশ ১৫ সেকেন্ড সেকার পর উল্টে আলতো চাপ দিন।",
        },
        {
          num: "৩",
          heading: "ফুলকো নরম গরম রুটি রেডি",
          text: "রুটি বলের মতো ফুলে উঠবে! হটপটে রাখুন বা পরিবেশন করুন।",
        },
      ],
      tip: "💡 প্রো-টিপ: প্রতিটি রুটির মাঝে প্লাস্টিক সেপারেটর দেওয়া থাকে, তাই ফ্রিজে কখনো জড়াবে না।",
    },
    steam: {
      title: "ভাপে সেদ্ধ / স্টিম — মাত্র ৫ মিনিট",
      subtitle: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো ও ঝাল পুলি পিঠা",
      time: "৫-৬ মিনিট",
      recommendedFor: "চিকেন মোমো, ঝাল পুলি পিঠা",
      image: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
      targetSlug: "premium-leaf-shaped-chicken-momos-12pcs",
      steps: [
        {
          num: "১",
          heading: "স্টিমার প্রস্তুত করুন",
          text: "রাইস কুকার বা পাতিলের ওপর চালনিতে তেল মেখে মোমো দিন।",
        },
        {
          num: "২",
          heading: "৫ মিনিট ভাপ দিন",
          text: "ঢাকনা দিয়ে ৫-৬ মিনিট ভাপ দিলেই ভেতরটা রসালো জুসি হয়ে যাবে।",
        },
        {
          num: "৩",
          heading: "সস দিয়ে গরম পরিবেশন",
          text: "ধোঁয়া ওঠা মোমো সাথে ঝাল চাটনি দিয়ে পরিবেশন করুন।",
        },
      ],
      tip: "💡 প্রো-টিপ: প্যান-ফ্রাইড মোমো চাইলে সামান্য তেলে নিচটা গোল্ডেন করে পানি দিয়ে ঢেকে দিন।",
    },
    fry: {
      title: "ডুবো তেলে মুচমুচে ফ্রাই — ৩-৪ মিনিট",
      subtitle: "চিকেন স্প্রিং রোল, ঘরোয়া খাস্তা সিঙ্গারা ও সমুচা",
      time: "৩-৪ মিনিট",
      recommendedFor: "চিকেন স্প্রিং রোল, সিঙ্গারা, সমুচা বাইট",
      image: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
      targetSlug: "crispy-frozen-chicken-spring-rolls-10pcs",
      steps: [
        {
          num: "১",
          heading: "তেল গরম করুন",
          text: "কড়াইতে ডুবো তেল মাঝারি আঁচে ভালো করে গরম করে নিন।",
        },
        {
          num: "২",
          heading: "ফ্রোজেন অবস্থায় তেলে ছাড়ুন",
          text: "সরাসরি তেলে ছেড়ে মাঝারি আঁচে ৩-৪ মিনিট গোল্ডেন হওয়া পর্যন্ত ভাজুন।",
        },
        {
          num: "৩",
          heading: "এক্সট্রা ক্রিস্পি স্বাদ",
          text: "তেল ঝরিয়ে কিচেন টিস্যুতে রাখুন। মচমচে নাস্তা একদম রেডি!",
        },
      ],
      tip: "💡 প্রো-টিপ: তেল খুব বেশি কড়া গরম করবেন না; মাঝারি আঁচে ভাজলে দীর্ঘক্ষণ মুচমুচে থাকবে।",
    },
  };

  const current = guideData[activeMode];

  return (
    <section className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3.5">
      <div className="bg-gradient-to-br from-[#1F0E03] to-[#3D1D06] rounded-2xl p-3 sm:p-5 text-white shadow-md relative overflow-hidden border border-amber-900/40">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] sm:text-[11px] font-bold mb-1 border border-amber-400/30">
              <Sparkles className="w-3 h-3" />
              <span>{isBn ? "সহজ কুকিং গাইড" : "Quick Cooking Mode"}</span>
            </div>
            <h2 className="text-sm sm:text-lg font-bold font-display text-white">
              {isBn ? "রান্নার সহজ নিয়ম ও সময় (মাত্র ৩-৫ মিনিট)" : "Easy Ready-to-Cook Instructions"}
            </h2>
          </div>

          {/* Cooking Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMode("pan")}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeMode === "pan"
                  ? "bg-amber-400 text-stone-950 shadow-xs font-extrabold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              🫓 তাওয়ায় সেকা
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("steam")}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeMode === "steam"
                  ? "bg-amber-400 text-stone-950 shadow-xs font-extrabold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              🥟 ভাপ / স্টিম
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("fry")}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeMode === "fry"
                  ? "bg-amber-400 text-stone-950 shadow-xs font-extrabold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              🌯 মুচমুচে ফ্রাই
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center relative z-10">
          {/* Left: Product Thumbnail (object-contain so no image is ever cropped) */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            <div className="relative w-full aspect-square max-h-[190px] sm:max-h-[210px] rounded-xl overflow-hidden border border-amber-400/30 bg-[#140802] shadow-sm flex items-center justify-center group p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-amber-400/40 flex items-center gap-1 text-amber-300 text-[10px] sm:text-[11px] font-mono font-bold shadow-xs">
                <Clock className="w-3 h-3" />
                <span>সময়: {current.time}</span>
              </div>
            </div>

            <Link
              href={`/products/${current.targetSlug}`}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold text-[11px] sm:text-xs py-1.5 px-3 rounded-lg shadow-xs transition-all active:scale-95"
            >
              <span>এই আইটেমটি অর্ডার করুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right: Step by Step Flow */}
          <div className="lg:col-span-8 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {current.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-5 h-5 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs mb-1.5 shadow-xs">
                      {step.num}
                    </div>
                    <h4 className="text-xs font-bold text-white mb-0.5">
                      {step.heading}
                    </h4>
                    <p className="text-[10.5px] sm:text-[11px] text-stone-300 leading-snug">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip Box */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-200 text-[10.5px] sm:text-[11px] flex items-start gap-1.5">
              <span className="shrink-0">{current.tip}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
