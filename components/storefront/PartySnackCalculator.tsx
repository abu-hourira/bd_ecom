"use client";
// components/storefront/PartySnackCalculator.tsx - Smart Guest & Party Snack Calculator

import { useState } from "react";
import { Users, Calculator, Sparkles, ShoppingBag, Zap, CheckCircle2, ChevronRight, Truck } from "lucide-react";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import QuickOrderModal from "@/components/storefront/QuickOrderModal";

type OccasionType = "breakfast" | "evening" | "party";

export default function PartySnackCalculator() {
  const { addToCart, setIsCartOpen } = useCart();
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  const [guestCount, setGuestCount] = useState<number>(6);
  const [occasion, setOccasion] = useState<OccasionType>("evening");
  const [quickOrderProduct, setQuickOrderProduct] = useState<any | null>(null);

  // Calculation Logic
  const getRecommendation = () => {
    if (occasion === "breakfast") {
      // 2-3 rotis per person
      const totalRotis = guestCount * 3;
      const rotiPacks = Math.ceil(totalRotis / 20);
      const subtotal = rotiPacks * 230;
      return {
        title: `${guestCount} জনের সকালের নাস্তা প্যাকেজ`,
        items: [
          { name: "হাতে তৈরি লাল আটার ফ্রোজেন রুটি", qty: `${rotiPacks} প্যাক (${rotiPacks * 20} পিস)`, price: rotiPacks * 230 },
        ],
        subtotal,
        discount: Math.round(subtotal * 0.1),
        finalPrice: Math.round(subtotal * 0.9),
      };
    } else if (occasion === "evening") {
      // 2 momos + 1 roll + 1 samosa per person
      const momoPacks = Math.max(1, Math.ceil((guestCount * 2) / 12));
      const rollPacks = Math.max(1, Math.ceil(guestCount / 10));
      const samosaPacks = Math.max(1, Math.ceil(guestCount / 10));
      const subtotal = momoPacks * 280 + rollPacks * 299 + samosaPacks * 190;
      return {
        title: `${guestCount} জনের বিকেলের মুখরোচক নাস্তা প্যাক`,
        items: [
          { name: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো", qty: `${momoPacks} প্যাক (${momoPacks * 12} পিস)`, price: momoPacks * 280 },
          { name: "মুচমুচে ফ্রোজেন চিকেন স্প্রিং রোল", qty: `${rollPacks} প্যাক (${rollPacks * 10} পিস)`, price: rollPacks * 299 },
          { name: "ঘরোয়া খাস্তা সিঙ্গারা ও সমুচা", qty: `${samosaPacks} প্যাক (${samosaPacks * 10} পিস)`, price: samosaPacks * 190 },
        ],
        subtotal,
        discount: Math.round(subtotal * 0.12),
        finalPrice: Math.round(subtotal * 0.88),
      };
    } else {
      // Party / Guests Mega Spread
      const rotiPacks = Math.max(1, Math.ceil((guestCount * 2) / 20));
      const momoPacks = Math.max(1, Math.ceil((guestCount * 2) / 12));
      const rollPacks = Math.max(1, Math.ceil((guestCount * 2) / 10));
      const subtotal = rotiPacks * 230 + momoPacks * 280 + rollPacks * 299;
      return {
        title: `${guestCount} জনের স্পেশাল মেহমানদারি ও পার্টি কম্বো`,
        items: [
          { name: "হাতে তৈরি লাল আটার রুটি", qty: `${rotiPacks} প্যাক (${rotiPacks * 20} পিস)`, price: rotiPacks * 230 },
          { name: "পাতা শেইপ চিকেন মোমো", qty: `${momoPacks} প্যাক (${momoPacks * 12} পিস)`, price: momoPacks * 280 },
          { name: "মুচমুচে ফ্রোজেন স্প্রিং রোল", qty: `${rollPacks} প্যাক (${rollPacks * 10} পিস)`, price: rollPacks * 299 },
        ],
        subtotal,
        discount: Math.round(subtotal * 0.15),
        finalPrice: Math.round(subtotal * 0.85),
      };
    }
  };

  const currentPlan = getRecommendation();

  const handleOrderPartyPackage = () => {
    const pkgProduct = {
      id: 999200 + guestCount,
      name: currentPlan.title,
      price: currentPlan.subtotal,
      discountPrice: currentPlan.finalPrice,
      images: ["/uploads/upload-1787287687330-fwbvn_1000019648.jpg"],
      unit: "পার্টি প্যাকেজ",
      unitQuantity: `${guestCount} জনের নাস্তা`,
    };
    setQuickOrderProduct(pkgProduct);
  };

  const handleAddToCartPartyPackage = () => {
    const pkgProduct = {
      id: 999200 + guestCount,
      name: currentPlan.title,
      price: currentPlan.subtotal,
      discountPrice: currentPlan.finalPrice,
      images: ["/uploads/upload-1787287687330-fwbvn_1000019648.jpg"],
      unit: "পার্টি প্যাকেজ",
      unitQuantity: `${guestCount} জনের নাস্তা`,
    };
    addToCart(pkgProduct, 1);
    setIsCartOpen(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
      <div className="bg-gradient-to-br from-[#1F0E03] via-[#331807] to-[#1F0E03] rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 text-white shadow-lg border border-amber-500/30 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-1 mb-3 sm:mb-5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[9.5px] sm:text-[11px] uppercase tracking-wider shadow-2xs">
            <Calculator className="w-3 h-3" />
            <span>{isBn ? "স্মার্ট মেহমানদারি ক্যালকুলেটর" : "Smart Snack Calculator"}</span>
          </div>
          <h2 className="text-sm sm:text-xl lg:text-2xl font-extrabold font-display text-white">
            {isBn ? "মেহমান বা পরিবারের সদস্য সংখ্যা নির্বাচন করুন" : "Calculate Exact Food Packs Needed"}
          </h2>
          <p className="text-[11px] sm:text-xs text-amber-100/80">
            {isBn
              ? "সদস্য সংখ্যা দিলেই সিস্টেম স্বয়ংক্রিয়ভাবে পারফেক্ট নাস্তা প্যাকেজ তৈরি করে দেবে।"
              : "Choose guest count & occasion to automatically calculate the exact snack combination."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-center">
          {/* Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Occasion Switcher */}
            <div className="space-y-1.5">
              <label className="block text-[11px] sm:text-xs font-bold text-amber-200">
                ১. উপলক্ষ বা নাস্তার ধরন নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setOccasion("breakfast")}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    occasion === "breakfast"
                      ? "bg-amber-400 text-stone-950 font-extrabold border-amber-400 shadow-2xs"
                      : "bg-white/10 text-white hover:bg-white/20 border-white/10 text-xs"
                  }`}
                >
                  <span className="text-sm sm:text-base block mb-0.5">🌅</span>
                  <span className="text-[10.5px] sm:text-xs">সকালের নাস্তা</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOccasion("evening")}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    occasion === "evening"
                      ? "bg-amber-400 text-stone-950 font-extrabold border-amber-400 shadow-2xs"
                      : "bg-white/10 text-white hover:bg-white/20 border-white/10 text-xs"
                  }`}
                >
                  <span className="text-sm sm:text-base block mb-0.5">☕</span>
                  <span className="text-[10.5px] sm:text-xs">বিকেলের চা</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOccasion("party")}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    occasion === "party"
                      ? "bg-amber-400 text-stone-950 font-extrabold border-amber-400 shadow-2xs"
                      : "bg-white/10 text-white hover:bg-white/20 border-white/10 text-xs"
                  }`}
                >
                  <span className="text-sm sm:text-base block mb-0.5">🎉</span>
                  <span className="text-[10.5px] sm:text-xs">পার্টি / মেহমান</span>
                </button>
              </div>
            </div>

            {/* Guest Count Slider */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-amber-200 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>২. পরিবারের সদস্য বা মেহমান সংখ্যা:</span>
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300 font-mono bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                  {guestCount} জন
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex justify-between text-[9px] sm:text-[10px] text-stone-300 font-mono">
                <span>২ জন</span>
                <span>১০ জন</span>
                <span>২৫ জন (বড় পার্টি)</span>
              </div>
            </div>
          </div>

          {/* Result Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white text-stone-900 rounded-2xl p-3 sm:p-4 shadow-md border border-amber-200 space-y-2.5">
            <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 font-display">
                  ✨ প্রস্তাবিত প্যাকেজ
                </h3>
                <span className="text-[10.5px] text-forest font-bold block truncate">
                  {currentPlan.title}
                </span>
              </div>
              <span className="text-[9.5px] font-black bg-emerald-600 text-white px-2 py-0.2 rounded-md">
                ফ্রি ডেলিভারি
              </span>
            </div>

            {/* Item Breakdown */}
            <div className="space-y-1">
              {currentPlan.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10.5px] sm:text-[11px] py-0.5 border-b border-stone-50">
                  <span className="font-semibold text-stone-800 truncate">{item.name}</span>
                  <span className="text-stone-500 font-mono shrink-0 ml-1">{item.qty}</span>
                </div>
              ))}
            </div>

            {/* Savings & Total Strip */}
            <div className="p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-1 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>মোট আইটেম মূল্য:</span>
                <span className="font-mono line-through text-stone-400">{formatTaka(currentPlan.subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>পার্টি সাশ্রয় (১০-১৫% ছাড়):</span>
                <span className="font-mono font-bold">-{formatTaka(currentPlan.discount)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-black text-stone-950 pt-1 border-t border-stone-300">
                <span>সর্বমোট প্যাকেজ মূল্য:</span>
                <span className="font-mono text-forest font-black text-base">{formatTaka(currentPlan.finalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={handleOrderPartyPackage}
                className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-forest to-[#843A02] hover:opacity-95 text-amber-300 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>প্যাকেজ অর্ডার</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCartPartyPackage}
                className="py-2.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কার্টে যোগ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Checkout Modal */}
      <QuickOrderModal
        product={quickOrderProduct}
        isOpen={Boolean(quickOrderProduct)}
        onClose={() => setQuickOrderProduct(null)}
      />
    </section>
  );
}
