"use client";
// components/storefront/CustomComboBuilder.tsx - Interactive "Build Your Own Frozen Snack Box"

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Check, Plus, Trash2, ShoppingBag, Truck, Zap, ShieldCheck } from "lucide-react";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import QuickOrderModal from "@/components/storefront/QuickOrderModal";

interface ProductOption {
  id: number;
  name: string;
  category: string;
  pieces: string;
  regularPrice: number;
  image: string;
}

const COMBO_OPTIONS: ProductOption[] = [
  // Slot 1: Roti options
  {
    id: 270001,
    name: "হাতে তৈরি লাল আটার ফ্রোজেন রুটি",
    category: "রুটি",
    pieces: "২০ পিস",
    regularPrice: 230,
    image: "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
  },
  {
    id: 270002,
    name: "হাতে তৈরি সাদা আটার নরম ফ্রোজেন রুটি",
    category: "রুটি",
    pieces: "২০ পিস",
    regularPrice: 220,
    image: "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
  },
  // Slot 2: Momo options
  {
    id: 270003,
    name: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো",
    category: "মোমো",
    pieces: "১২ পিস",
    regularPrice: 280,
    image: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
  },
  {
    id: 270006,
    name: "ঐতিহ্যবাহী ঝাল পুলি পিঠা",
    category: "পিঠা",
    pieces: "১০ পিস",
    regularPrice: 240,
    image: "/uploads/WhatsApp_Image_2026-08-14_at_12_17_00_PM_1787526929366_7lz8b.jpeg",
  },
  // Slot 3: Rolls
  {
    id: 270004,
    name: "মুচমুচে ফ্রোজেন চিকেন স্প্রিং রোল",
    category: "রোল",
    pieces: "১০ পিস",
    regularPrice: 299,
    image: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
  },
  // Slot 4: Shingara / Samosa
  {
    id: 270005,
    name: "হোমমেড খাস্তা সিঙ্গারা",
    category: "সিঙ্গারা",
    pieces: "১০ পিস",
    regularPrice: 190,
    image: "/uploads/upload-1787287646578-7y92p_1000019649.jpg",
  },
  {
    id: 270007,
    name: "ফ্রোজেন ট্রায়াঙ্গেল সমুচা বাইট",
    category: "সমুচা",
    pieces: "১০ পিস",
    regularPrice: 190,
    image: "/uploads/WhatsApp_Image_2026-08-14_at_12_17_01_PM_1787527594680_in6zn.jpeg",
  },
];

export default function CustomComboBuilder() {
  const { addToCart, setIsCartOpen } = useCart();
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  // Pre-select 4 popular items to start with
  const [selectedItems, setSelectedItems] = useState<ProductOption[]>([
    COMBO_OPTIONS[0], // Lal Atta Roti
    COMBO_OPTIONS[2], // Chicken Momo
    COMBO_OPTIONS[4], // Spring Roll
    COMBO_OPTIONS[5], // Shingara
  ]);

  const [quickOrderProduct, setQuickOrderProduct] = useState<any | null>(null);
  const [added, setAdded] = useState(false);

  const rawTotal = selectedItems.reduce((sum, item) => sum + item.regularPrice, 0);
  const discountAmount = Math.round(rawTotal * 0.15); // 15% Combo Discount
  const finalComboPrice = rawTotal - discountAmount;

  const handleToggleItem = (option: ProductOption) => {
    const isSelected = selectedItems.some((item) => item.id === option.id);
    if (isSelected) {
      if (selectedItems.length > 2) {
        setSelectedItems(selectedItems.filter((item) => item.id !== option.id));
      }
    } else {
      if (selectedItems.length < 5) {
        setSelectedItems([...selectedItems, option]);
      }
    }
  };

  const handleAddComboToCart = () => {
    const comboProduct = {
      id: 999100 + selectedItems.length,
      name: `কাস্টম ফ্যামিলি ফ্রোজেন কম্বো বক্স (${selectedItems.length}টি আইটেম)`,
      price: rawTotal,
      discountPrice: finalComboPrice,
      images: [selectedItems[0]?.image || "/uploads/upload-1787287847493-t5opy_1000018931.jpg"],
      unit: "কম্বো বক্স",
      unitQuantity: `${selectedItems.length} প্যাক`,
      description: selectedItems.map((item) => `${item.name} (${item.pieces})`).join(" + "),
    };

    addToCart(comboProduct, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 600);
  };

  const handleQuickOrderCombo = () => {
    const comboProduct = {
      id: 999100 + selectedItems.length,
      name: `কাস্টম ফ্যামিলি ফ্রোজেন কম্বো বক্স (${selectedItems.length}টি আইটেম)`,
      price: rawTotal,
      discountPrice: finalComboPrice,
      images: [selectedItems[0]?.image || "/uploads/upload-1787287847493-t5opy_1000018931.jpg"],
      unit: "কম্বো বক্স",
      unitQuantity: `${selectedItems.length} প্যাক`,
    };
    setQuickOrderProduct(comboProduct);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
      <div className="bg-gradient-to-br from-[#FAF5EE] via-[#F4EDE0] to-[#EAE0CF] rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border border-amber-300/80 shadow-md relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-1 mb-3 sm:mb-5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[9.5px] sm:text-[11px] uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>{isBn ? "🎁 কাস্টম কম্বো বক্স" : "Custom Combo Box"}</span>
          </div>
          <h2 className="text-sm sm:text-xl lg:text-2xl font-extrabold font-display text-stone-900 leading-tight">
            {isBn ? "পছন্দের ৩-৪টি আইটেম বেছে নিন, পান ১৫% স্পেশাল ছাড়!" : "Pick Your Favorite Packs & Save 15%!"}
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-600">
            {isBn
              ? "রুটি, মোমো, সিঙ্গারা ও রোল মিলিয়ে আপনার পরিবারের জন্য পারফেক্ট কম্বো বক্স সাজান।"
              : "Mix & match items to create your custom family box with 15% instant savings."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
          {/* Left 7 Cols: Compact Available Food Items Selection Grid (2-col on mobile) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span className="text-[11px] sm:text-xs">খাবারগুলো ট্যাপ করে যুক্ত বা বাদ দিন:</span>
              <span className="text-forest font-mono text-[11px] sm:text-xs bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                {selectedItems.length}/৫টি নির্বাচিত
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {COMBO_OPTIONS.map((opt) => {
                const isSelected = selectedItems.some((item) => item.id === opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleItem(opt)}
                    className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? "bg-white border-forest ring-1.5 ring-forest shadow-xs scale-101"
                        : "bg-white/70 border-amber-200/90 hover:bg-white hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[10px] sm:text-xs font-bold text-stone-900 truncate leading-tight">
                          {opt.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10.5px] text-stone-500 mt-0.2">
                          <span className="font-semibold text-forest truncate">{opt.pieces}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-stone-800 shrink-0">{formatTaka(opt.regularPrice)}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 text-xs transition-colors ${
                        isSelected
                          ? "bg-forest text-amber-300 font-bold"
                          : "border border-stone-300 text-transparent"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Live Combo Summary Box */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-3 sm:p-4 border border-amber-200/90 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 font-display">
                  📦 আপনার তৈরি কাস্টম বক্স
                </h3>
                <span className="text-[10px] text-stone-500">
                  {selectedItems.length}টি ফ্রোজেন প্যাক
                </span>
              </div>
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.2 rounded-md uppercase tracking-tight">
                ১৫% ছাড়
              </span>
            </div>

            {/* Selected Items Mini List */}
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[11px] py-0.5 border-b border-stone-50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-emerald-600 font-bold text-[10px]">✓</span>
                    <span className="font-semibold text-stone-800 truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900 shrink-0 text-[10.5px]">
                    {formatTaka(item.regularPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Free Delivery Banner */}
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300/80 flex items-center gap-1.5 text-[10px] text-emerald-900 font-bold">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>🎉 এই কম্বো বক্সে ১০০% ফ্রি হোম ডেলিভারি!</span>
            </div>

            {/* Price Calculations */}
            <div className="p-2 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-1 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>নিয়মিত মূল্য:</span>
                <span className="font-mono line-through text-stone-400">{formatTaka(rawTotal)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>কম্বো সেভিংস (১৫% ছাড়):</span>
                <span className="font-mono font-bold">-{formatTaka(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono font-bold text-emerald-700">ফ্রি (৳০)</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-black text-stone-950 pt-1.5 border-t border-stone-300">
                <span>সর্বমোট অফার মূল্য:</span>
                <span className="font-mono text-forest font-black text-base">{formatTaka(finalComboPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={handleQuickOrderCombo}
                className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-forest to-[#843A02] hover:opacity-95 text-amber-300 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>সরাসরি অর্ডার</span>
              </button>

              <button
                type="button"
                onClick={handleAddComboToCart}
                className="py-2.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{added ? "যোগ হয়েছে!" : "কার্টে যোগ করুন"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Checkout Modal for Combo */}
      <QuickOrderModal
        product={quickOrderProduct}
        isOpen={Boolean(quickOrderProduct)}
        onClose={() => setQuickOrderProduct(null)}
      />
    </section>
  );
}
