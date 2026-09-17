"use client";
// components/storefront/FoodStoryBubbles.tsx - Instagram-Style Top Food Stories & Story Viewer

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Zap, Sparkles, Flame, Snowflake, Clock } from "lucide-react";
import { formatTaka } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import QuickOrderModal from "@/components/storefront/QuickOrderModal";

interface FoodStory {
  id: number;
  slug: string;
  tag: string;
  name: string;
  headline: string;
  caption: string;
  price: number;
  regularPrice?: number;
  pieces: string;
  cookTime: string;
  image: string;
  organicBadge?: boolean;
}

const STORIES: FoodStory[] = [
  {
    id: 270001,
    slug: "handmade-whole-wheat-red-flour-frozen-roti-20pcs",
    tag: "ফুলকো রুটি",
    name: "হাতে তৈরি লাল আটার ফ্রোজেন রুটি",
    headline: "তাওয়ায় ৩০ সেকেন্ডেই ফুলকো গরম রুটি!",
    caption: "আটা মাখার ঝামেলা ছাড়াই সকালে ও রাতে পরিবেশন করুন ১০০% খাঁটি লাল আটার স্বাস্থ্যকর ফ্রোজেন রুটি।",
    price: 230,
    regularPrice: 260,
    pieces: "২০ পিস প্যাক",
    cookTime: "৩০ সেকেন্ড",
    image: "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
    organicBadge: true,
  },
  {
    id: 270003,
    slug: "handmade-leaf-shape-chicken-momo-12pcs",
    tag: "চিকেন মোমো",
    name: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো",
    headline: "রসালো ও ধোঁয়া ওঠা প্রিমিয়াম মোমো!",
    caption: "পাতলা নরম স্কিন আর ভেতরে খাঁটি মশলাদার চিকেন পুর। ভাপ দিন মাত্র ৫ মিনিট আর পরিবেশন করুন স্পাইসি চাটনি দিয়ে।",
    price: 280,
    regularPrice: 320,
    pieces: "১২ পিস প্যাক",
    cookTime: "৫ মিনিট",
    image: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
  },
  {
    id: 270004,
    slug: "crispy-frozen-chicken-spring-rolls-10pcs",
    tag: "স্প্রিং রোল",
    name: "মুচমুচে ফ্রোজেন চিকেন স্প্রিং রোল",
    headline: "বিকেলের চায়ের সেরা ক্রিস্পি নাস্তা!",
    caption: "ডুবো তেলে ৩-৪ মিনিট ভাজলেই বাইরে মুচমুচে খাস্তা ও ভেতরে জুসি চিকেন ফিলিং।",
    price: 299,
    regularPrice: 350,
    pieces: "১০ পিস প্যাক",
    cookTime: "৩-৪ মিনিট",
    image: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
  },
  {
    id: 270005,
    slug: "homemade-frozen-shingara-kalojira-10pcs",
    tag: "খাস্তা সিঙ্গারা",
    name: "ঘরোয়া স্পেশাল খাস্তা সিঙ্গারা",
    headline: "কালোজিরার ফ্লেভারে নিখুঁত খাস্তা স্বাদ!",
    caption: "ঘরোয়া পরিচ্ছন্নতায় তৈরি আলুর পুরভরা পারফেক্ট সিঙ্গারা। ডুবো তেলে ভাজুন গোল্ডেন ব্রাউন হওয়া পর্যন্ত।",
    price: 190,
    regularPrice: 220,
    pieces: "১০ পিস প্যাক",
    cookTime: "৪ মিনিট",
    image: "/uploads/upload-1787287646578-7y92p_1000019649.jpg",
  },
  {
    id: 270006,
    slug: "traditional-frozen-spicy-puli-pitha-10pcs",
    tag: "ঝাল পুলি পিঠা",
    name: "ঐতিহ্যবাহী ঝাল পুলি পিঠা",
    headline: "শীতের আমেজে খাঁটি মুখরোচক পিঠা!",
    caption: "গ্রামের ঐতিহ্যবাহী রেসিপিতে তৈরি ফ্রোজেন ঝাল পুলি। ভাপ দিয়ে বা ভেজে খাওয়ার উপযোগী।",
    price: 240,
    regularPrice: 280,
    pieces: "১০ পিস প্যাক",
    cookTime: "৫ মিনিট",
    image: "/uploads/WhatsApp_Image_2026-08-14_at_12_17_00_PM_1787526929366_7lz8b.jpeg",
  },
  {
    id: 270008,
    slug: "all-in-one-frozen-family-mega-combo-box",
    tag: "ফ্যামিলি কম্বো",
    name: "অল-ইন-ওয়ান ফ্রোজেন মেগা কম্বো",
    headline: "এক বক্সে সব নাস্তা — সাথে ফ্রি ডেলিভারি!",
    caption: "রুটি, মোমো, রোল ও সিঙ্গারার অল-ইন-ওয়ান মেগা ফ্যামিলি প্যাকেজ যাতে রয়েছে ১৯% সাশ্রয়।",
    price: 890,
    regularPrice: 1100,
    pieces: "ফ্যামিলি বক্স",
    cookTime: "৫ মিনিট",
    image: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
  },
];

export default function FoodStoryBubbles() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [quickOrderProduct, setQuickOrderProduct] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Story Auto-Progress Timer (5 seconds per story)
  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (activeStoryIndex < STORIES.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // increments every 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex]);

  const activeStory = activeStoryIndex !== null ? STORIES[activeStoryIndex] : null;

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setProgress(0);
  };

  const handleNextStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex < STORIES.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1.5 sm:pt-3">
      {/* Top Bubble Rail */}
      <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-1 scrollbar-none snap-x">
        {STORIES.map((story, index) => (
          <button
            key={story.id}
            type="button"
            onClick={() => handleOpenStory(index)}
            className="snap-start shrink-0 flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
          >
            {/* Animated Gradient Ring */}
            <div className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-300 group-hover:scale-105 transition-transform duration-300 shadow-2xs shrink-0 flex items-center justify-center">
              <div className="w-full h-full p-0.5 rounded-full bg-white flex items-center justify-center">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 block"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                </div>
              </div>
            </div>

            <span className="text-[10px] sm:text-xs font-bold text-stone-800 group-hover:text-forest transition-colors truncate max-w-[60px] sm:max-w-[72px] text-center leading-tight">
              {story.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Instagram Story Viewer Modal */}
      {mounted &&
        activeStory &&
        createPortal(
          <div
            onClick={() => setActiveStoryIndex(null)}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-md h-full sm:h-[90vh] bg-stone-950 rounded-none sm:rounded-4xl overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              {/* Top Progress Bar & Header */}
              <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 space-y-2.5 bg-gradient-to-b from-black/80 to-transparent">
                {/* Segmented Progress Bars */}
                <div className="flex gap-1.5">
                  {STORIES.map((_, idx) => (
                    <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-100"
                        style={{
                          width:
                            idx < (activeStoryIndex || 0)
                              ? "100%"
                              : idx === activeStoryIndex
                              ? `${progress}%`
                              : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Profile / Food Tag */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeStory.image} alt={activeStory.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold leading-none">{activeStory.name}</h4>
                      <span className="text-[10px] text-amber-300 font-mono">⚡ {activeStory.cookTime} কুকিং</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStoryIndex(null)}
                    className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm cursor-pointer hover:bg-black/80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Story High-Res Image Display */}
              <div className="relative flex-1 w-full bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeStory.image}
                  alt={activeStory.name}
                  className="w-full h-full object-cover sm:object-contain"
                />

                {/* Left/Right Click Nav Trigger Zones */}
                <div
                  onClick={handlePrevStory}
                  className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                  title="Previous story"
                />
                <div
                  onClick={handleNextStory}
                  className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
                  title="Next story"
                />

                {/* Desktop Left/Right Buttons */}
                <button
                  type="button"
                  onClick={handlePrevStory}
                  disabled={activeStoryIndex === 0}
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 text-white items-center justify-center hover:bg-black/90 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextStory}
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 text-white items-center justify-center hover:bg-black/90 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Card: Headline, Caption & 1-Click Order Button */}
              <div className="relative z-30 p-4 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent text-white space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-300 font-mono bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                      {activeStory.pieces}
                    </span>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-lg font-black text-amber-300">
                        {formatTaka(activeStory.price)}
                      </span>
                      {activeStory.regularPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          {formatTaka(activeStory.regularPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-black font-display text-white">
                    {activeStory.headline}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed line-clamp-2">
                    {activeStory.caption}
                  </p>
                </div>

                {/* 1-Click Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    const productObj = {
                      id: activeStory.id,
                      name: activeStory.name,
                      price: activeStory.price,
                      discountPrice: activeStory.price,
                      images: [activeStory.image],
                      unit: activeStory.pieces,
                    };
                    setActiveStoryIndex(null);
                    setQuickOrderProduct(productObj);
                  }}
                  className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  <Zap className="w-4 h-4 fill-stone-950" />
                  <span>এখনই ১-ক্লিকে অর্ডার করুন — {formatTaka(activeStory.price)}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 1-Click Fast Checkout Modal */}
      <QuickOrderModal
        product={quickOrderProduct}
        isOpen={Boolean(quickOrderProduct)}
        onClose={() => setQuickOrderProduct(null)}
      />
    </section>
  );
}
