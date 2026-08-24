"use client";
// app/page.tsx - Mobile-First & Ultra-Polished Storefront

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Star,
  Award,
  CheckCircle2,
  Phone,
  Flame,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { formatTaka, getSafeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const { t, locale } = useLanguage();

  useEffect(() => {
    fetch("/api/storefront/home", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const categories = data?.categories || [];
  const products = data?.featuredProducts || [];
  const comboDeals = data?.comboDeals || [];

  const filteredProducts =
    selectedCategoryTab === "all"
      ? products
      : products.filter((p: any) => p.category?.slug === selectedCategoryTab);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="space-y-8 sm:space-y-16 pb-24 md:pb-20">
        {/* 1. Mobile-Optimized & Desktop-Rich Hero Banner */}
        <section className="relative overflow-hidden bg-[#143520] text-white py-6 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/20">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
            {/* Left Main Hero Copy */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              {/* Organic Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 text-amber-300 text-[11px] sm:text-xs font-semibold tracking-wide border border-amber-300/30 shadow-xs">
                <Leaf className="w-3.5 h-3.5" />
                <span>{t("hero.badge")}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-display tracking-tight text-white leading-[1.2]">
                {t("hero.title")}{" "}
                <span className="text-amber-400 block sm:inline">{t("hero.titleHighlight")}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm lg:text-base text-stone-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t("hero.subtitle")}
              </p>

              {/* Action Buttons (Compact on Mobile) */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-1">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t("hero.ctaExplore")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t("hero.ctaTrack")}</span>
                </Link>
              </div>

              {/* Quick Trust Badges Strip (Mobile & Desktop) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/15 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-base sm:text-2xl font-bold font-display text-amber-400">
                    {t("hero.metric1Value")}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-300 font-medium leading-tight">
                    {t("hero.metric1Label")}
                  </div>
                </div>
                <div className="text-center lg:text-left border-x border-white/10 lg:border-none px-1">
                  <div className="text-base sm:text-2xl font-bold font-display text-amber-400">
                    {t("hero.metric2Value")}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-300 font-medium leading-tight">
                    {t("hero.metric2Label")}
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-base sm:text-2xl font-bold font-display text-amber-400">
                    {t("hero.metric3Value")}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-300 font-medium leading-tight">
                    {t("hero.metric3Label")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Promo Highlight (Desktop Only to save mobile scroll space) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="bg-emerald-950/70 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold font-mono border border-amber-400/30">
                    {t("hero.badge")}
                  </span>
                  <Award className="w-6 h-6 text-amber-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-xs text-stone-300 ml-1.5 font-medium">
                      ১০০% নির্ভরযোগ্য গ্যারান্টি
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display leading-snug">
                    সুন্দরবনের কাঁচা মধু ও কাঠের ঘানির খাঁটি তেল
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    কোনো কৃত্রিম প্রিজারভেটিভ বা ভেজালহীন বাছাইকৃত প্রাকৃতিক বিষমুক্ত সামগ্রী ও প্রক্রিয়াজাত।
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-400">সর্বমোট ডেলিভারি</div>
                    <div className="text-lg font-bold text-amber-400 font-display">১২,০০০+ পরিবার</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-400">প্রাকৃতিক উৎস</div>
                    <div className="text-lg font-bold text-emerald-400 font-display">১০০% খাঁটি ও অর্গানিক</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Fast Horizontal Category Story-Bar (Instant Access on Mobile) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-lg font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-forest" />
              <span>{locale === "bn" ? "জনপ্রিয় ক্যাটাগরি" : "Top Categories"}</span>
            </h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-0.5"
            >
              <span>{locale === "bn" ? "সবগুলো দেখুন" : "View All"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
            {/* All Category Pill */}
            <button
              onClick={() => setSelectedCategoryTab("all")}
              className={`snap-start shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                selectedCategoryTab === "all"
                  ? "bg-forest text-white border-forest shadow-sm scale-105"
                  : "bg-white text-stone-700 border-stone-200 hover:border-forest/40"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{t("products.filterAll")}</span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((c: any) => {
              const isSelected = selectedCategoryTab === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryTab(c.slug)}
                  className={`snap-start shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? "bg-forest text-white border-forest shadow-sm scale-105"
                      : "bg-white text-stone-700 border-stone-200 hover:border-forest/40"
                  }`}
                >
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Main Product Grid — Immediately in View! */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>{t("products.title")}</span>
              </h2>
              <p className="text-xs text-stone-500 hidden sm:block">
                {t("products.subtitle")}
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-forest bg-forest-soft px-2.5 py-1 rounded-full border border-forest/15">
              {filteredProducts.length} {locale === "bn" ? "টি পণ্য" : "items"}
            </span>
          </div>

          {/* 2-Columns on Mobile, 4-Columns on Desktop */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full aspect-square bg-stone-100 rounded-xl" />
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-8 bg-stone-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
              <Leaf className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-stone-800 font-display">
                কোনো পণ্য পাওয়া যায়নি
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                অন্য ক্যাটাগরি সিলেক্ট করুন বা সব পণ্য দেখুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* View Full Catalog Button */}
          <div className="text-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-forest font-bold text-xs sm:text-sm border border-forest/30 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{t("products.viewFull")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 4. Family Combo & Bundle Deals */}
        {comboDeals.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="bg-[#F7F4EE] p-4 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold tracking-wider uppercase">
                    {t("combos.badge")}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold font-display text-stone-900 mt-1">
                    {t("combos.title")}
                  </h2>
                </div>

                <Link
                  href="/products?category=combo-bundle-deals"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline cursor-pointer"
                >
                  <span>{t("combos.viewAll")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
                {comboDeals.map((combo: any) => (
                  <ProductCard key={combo.id} product={combo} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Customer Testimonials */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="text-lg sm:text-2xl font-bold font-display text-stone-900">
                {t("testimonials.title")}
              </h2>
              <p className="text-xs text-stone-600">
                {t("testimonials.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  &quot;সুন্দরবনের কাঁচা মধুটির স্বাদ এবং ঘ্রাণ অসাধারণ। বাজারের চিনিযুক্ত মধুর চেয়ে অনেক গুণ ভালো। প্যাকেজিংও খুব প্রিমিয়াম।&quot;
                </p>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-900">ডাঃ রাশেদ করিম (ধানমন্ডি)</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("testimonials.verified")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  &quot;ঐতিহ্যবাহী কাঠের ঘানির সরিষার তেলের ঝাঁঝ দারুণ! অর্ডারের মাত্র ৫ ঘণ্টায় উত্তরায় হোম ডেলিভারি পেয়েছি।&quot;
                </p>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-900">নুসরাত জাহান (উত্তরা)</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("testimonials.verified")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  &quot;গাওয়া ঘির দানা ও খাঁটি মিষ্টি সুবাস পুরো রান্নাঘরে ছড়িয়ে পড়ে। প্রতিটি স্ট্যাটাস পরিবর্তনের লাইভ SMS ট্র্যাকিং সত্যিই প্রশংসনীয়।&quot;
                </p>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-900">তানভীর আহমেদ (মিরপুর)</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("testimonials.verified")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
