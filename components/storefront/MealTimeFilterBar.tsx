"use client";
// components/storefront/MealTimeFilterBar.tsx - Quick Meal-Time Dining Occasion Filter Bar

import { useState } from "react";
import { Coffee, Sunrise, Sunset, Gift, Utensils } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MealTimeFilterBarProps {
  selectedMeal: string;
  onSelectMeal: (meal: string) => void;
}

const MEAL_TIMES = [
  { id: "all", label: "সকল খাবার", icon: "🍽️", countTag: "৮টি আইটেম" },
  { id: "breakfast", label: "সকালের নাস্তা", icon: "🌅", countTag: "রুটি ও পরোটা" },
  { id: "evening", label: "বিকেলের নাস্তা ও চা", icon: "☕", countTag: "মোমো, রোল ও সিঙ্গারা" },
  { id: "tiffin", label: "বাচ্চাদের টিফিন", icon: "🎒", countTag: "ঝটপট ৫ মিনিটে" },
  { id: "combo", label: "ফ্যামিলি কম্বো ডিলস", icon: "🎁", countTag: "১৫% ছাড়" },
];

export default function MealTimeFilterBar({ selectedMeal, onSelectMeal }: MealTimeFilterBarProps) {
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
      <div className="bg-[#FAF6F0] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-amber-200/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none snap-x">
        <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-forest shrink-0 pl-2">
          <span>⚡ মিল টাইম ফিল্টার:</span>
        </span>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto justify-start lg:justify-end">
          {MEAL_TIMES.map((m) => {
            const isSelected = selectedMeal === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMeal(m.id)}
                className={`snap-start px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 border ${
                  isSelected
                    ? "bg-forest text-amber-300 border-forest shadow-md scale-103"
                    : "bg-white text-stone-700 hover:bg-stone-100 border-stone-200"
                }`}
              >
                <span className="text-sm">{m.icon}</span>
                <span>{m.label}</span>
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? "bg-black/30 text-amber-200" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {m.countTag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
