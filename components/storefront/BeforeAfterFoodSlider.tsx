"use client";
// components/storefront/BeforeAfterFoodSlider.tsx - Interactive Raw vs Cooked Food Visual Comparison

import { useState } from "react";
import { Flame, Snowflake, ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ComparisonItem {
  id: string;
  name: string;
  rawLabel: string;
  cookedLabel: string;
  rawImage: string;
  cookedImage: string;
  cookTime: string;
  description: string;
}

const COMPARISON_ITEMS: ComparisonItem[] = [
  {
    id: "roti",
    name: "হাতে তৈরি লাল আটার রুটি",
    rawLabel: "❄️ ফ্রোজেন কাঁচা রুটি",
    cookedLabel: "🍳 ৩০ সেকেন্ডে তাওয়ায় ফুলকো",
    rawImage: "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
    cookedImage: "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
    cookTime: "৩০ সেকেন্ড",
    description: "আটা মাখার ঝামেলা ছাড়াই গরম তাওয়ায় দিলে বলের মতো ফুলে ওঠে এবং সারাদিন নরম থাকে।",
  },
  {
    id: "momo",
    name: "পাতা শেইপ চিকেন মোমো",
    rawLabel: "❄️ ফ্রোজেন মোমো",
    cookedLabel: "🥟 ৫ মিনিট ভাপে জুসি মোমো",
    rawImage: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
    cookedImage: "/uploads/WhatsApp_Image_2026-08-14_at_12_17_00_PM_1787526929366_7lz8b.jpeg",
    cookTime: "৫ মিনিট",
    description: "পাতলা নরম স্কিনের ভেতর প্রিমিয়াম চিকেন কিমা। ভাপ দিলেই বের হবে রসালো জুসি ফ্লেভার।",
  },
  {
    id: "roll",
    name: "মুচমুচে চিকেন স্প্রিং রোল",
    rawLabel: "❄️ ফ্রোজেন রোল",
    cookedLabel: "🌯 ডুবো তেলে সোনালী ক্রিস্পি",
    rawImage: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
    cookedImage: "/uploads/upload-1787287646578-7y92p_1000019649.jpg",
    cookTime: "৩-৪ মিনিট",
    description: "মাঝারি আঁচে ভাজলেই বাইরে অসাধারণ মুচমুচে খাস্তা এবং ভেতরে ঘরোয়া চিকেন পুর।",
  },
];

export default function BeforeAfterFoodSlider() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  const [selectedId, setSelectedId] = useState("roti");
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100

  const activeItem = COMPARISON_ITEMS.find((item) => item.id === selectedId) || COMPARISON_ITEMS[0];

  return (
    <section className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3.5">
      <div className="bg-white rounded-2xl p-3 sm:p-5 border border-stone-200/90 shadow-sm space-y-3.5">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider">
            <ArrowLeftRight className="w-3 h-3" />
            <span>{isBn ? "কাঁচা বনাম রান্নার স্বাদ" : "Raw Frozen vs Cooked"}</span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold font-display text-stone-900">
            {isBn ? "দেখুন রান্নার পর খাবারগুলো কতটা লোভনীয় দেখায়" : "Experience How Fresh & Crispy They Turn Out"}
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-600">
            {isBn
              ? "স্লাইডারটি টেনে ফ্রোজেন কাঁচা খাবার ও প্রস্তুতকৃত গরম খাবারের পরিবর্তন দেখুন।"
              : "Drag the slider handle to compare frozen raw state vs ready-to-eat cooked state."}
          </p>
        </div>

        {/* Food Switcher Tabs */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-0.5">
          {COMPARISON_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedId(item.id);
                setSliderPosition(50);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                selectedId === item.id
                  ? "bg-forest text-amber-300 shadow-xs scale-102"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Interactive Before & After Image Canvas */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Slider Container */}
          <div className="md:col-span-7 relative aspect-square max-h-[220px] sm:max-h-[250px] w-full mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-amber-200 select-none touch-none group bg-stone-900">
            {/* Background Image: Cooked / Fried */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeItem.cookedImage}
              alt={activeItem.cookedLabel}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-xs text-amber-300 text-[9.5px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>{activeItem.cookedLabel}</span>
            </div>

            {/* Foreground Image: Raw Frozen (Clipped) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-xl"
              style={{ width: `${sliderPosition}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.rawImage}
                alt={activeItem.rawLabel}
                className="absolute inset-y-0 left-0 max-w-none h-full w-full object-cover"
                style={{ width: "100%", height: "100%" }}
              />
              <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-emerald-300 text-[9.5px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                <Snowflake className="w-3 h-3 text-blue-400" />
                <span>{activeItem.rawLabel}</span>
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute inset-y-0 -ml-3.5 flex items-center justify-center pointer-events-none z-20"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-stone-900 shadow-lg border-2 border-forest flex items-center justify-center text-[10px] font-black cursor-ew-resize">
                <ArrowLeftRight className="w-3.5 h-3.5 text-forest" />
              </div>
            </div>

            {/* Invisible Range Input for Interactive Touch/Mouse drag */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Drag to compare raw and cooked food"
            />
          </div>

          {/* Details & Explanation */}
          <div className="md:col-span-5 space-y-2">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest font-mono">
                ⚡ রান্নার সময়: {activeItem.cookTime}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-display">
                {activeItem.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                {activeItem.description}
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                  ✓
                </span>
                <span>কোনো ক্ষতিকর প্রিজারভেটিভ বা কেমিক্যাল নেই।</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                  ✓
                </span>
                <span>ডিপ ফ্রিজ থেকে বের করেই সরাসরি রান্নাযোগ্য।</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                  ✓
                </span>
                <span>১০০% রেস্টুরেন্ট কোয়ালিটি ও ঘরোয়া স্বাদ।</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
