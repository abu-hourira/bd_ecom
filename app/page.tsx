// app/page.tsx
"use client";

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

      <main className="space-y-16 sm:space-y-20 pb-20">
        {/* 1. Hero Banner */}
        <section className="relative overflow-hidden bg-[#143520] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 text-amber-300 text-xs font-semibold tracking-wide border border-amber-300/30">
                <Leaf className="w-3.5 h-3.5" />
                <span>{t("hero.badge")}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white leading-[1.18]">
                {t("hero.title")} <br />
                <span className="text-amber-400">{t("hero.titleHighlight")}</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t("hero.subtitle")}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-95"
                >
                  <span>{t("hero.ctaExplore")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-95"
                >
                  <Truck className="w-4 h-4 text-amber-300" />
                  <span>{t("hero.ctaTrack")}</span>
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-amber-400">
                    {t("hero.metric1Value")}
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">
                    {t("hero.metric1Label")}
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-amber-400">
                    {t("hero.metric2Value")}
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">
                    {t("hero.metric2Label")}
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-amber-400">
                    {t("hero.metric3Value")}
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">
                    {t("hero.metric3Label")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Promo Highlight */}
            <div className="lg:col-span-5">
              <div className="bg-emerald-950/70 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold font-mono border border-amber-400/30">
                    {t("hero.badge")}
                  </span>
                  <Award className="w-6 h-6 text-amber-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-stone-200 text-xs font-semibold ml-1">
                      ১০০% বিশুদ্ধতার গ্যারান্টি
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    {locale === "bn"
                      ? "সুন্দরবনের কাঁচা মধু ও কাঠের ঘানির খাঁটি তেল"
                      : "Sundarban Raw Honey & Wood-Ghani Pure Oils"}
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {locale === "bn"
                      ? "কোনো ক্ষতিকর প্রিজারভেটিভ বা রিফাইনিং ছাড়াই প্রাকৃতিক নিয়মে সংগৃহীত ও প্রক্রিয়াজাত।"
                      : "Directly harvested from natural mangrove hives and indigenous village ghani churners without chemical refining."}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-stone-300">
                    <span className="text-amber-300 font-bold">৳১,৫০০+</span> অর্ডারে ফ্রি ডেলিভারি
                  </div>
                  <Link
                    href="/products"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
                  >
                    <span>{t("hero.badge")}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 10 Categories Circular / Card Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
              {t("categories.title")}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {t("categories.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-3.5">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-stone-200 hover:border-forest shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative w-12 h-12 rounded-xl bg-emerald-50 group-hover:ring-2 group-hover:ring-forest overflow-hidden flex items-center justify-center transition-all duration-200 mb-2 border border-stone-200">
                  {cat.image ? (
                    <Image
                      src={getSafeImageUrl(cat.image)}
                      alt={cat.name}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized={true}
                    />
                  ) : (
                    <Leaf className="w-5 h-5 text-emerald-700 group-hover:text-forest" />
                  )}
                </div>
                <span className="text-xs font-semibold text-stone-800 group-hover:text-forest transition-colors line-clamp-2 leading-tight">
                  {cat.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                  {cat._count?.products || 0} {t("categories.itemsCount")}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Farm Fresh Products Grid with Category Tabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("products.sectionBadge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
                {t("products.sectionTitle")}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryTab === "all"
                    ? "bg-forest text-white shadow-xs"
                    : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {t("products.allTab")} ({products.length})
              </button>
              {categories.slice(0, 6).map((c: any) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryTab(c.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategoryTab === c.slug
                      ? "bg-forest text-white shadow-xs"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <Leaf className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="font-bold text-base text-stone-800 font-display">
                {t("hero.badge")}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {t("hero.badge")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {filteredProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white hover:bg-emerald-50 text-forest font-bold text-xs sm:text-sm border border-forest/30 shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <span>{t("products.viewFull")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 4. Family Combo & Bundle Deals */}
        {comboDeals.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#F7F4EE] p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-extrabold tracking-wider uppercase">
                    {t("combos.badge")}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 mt-2">
                    {t("combos.title")}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    {t("combos.subtitle")}
                  </p>
                </div>

                <Link
                  href="/products?category=combo-bundle-deals"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline cursor-pointer"
                >
                  <span>{t("combos.viewAll")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {comboDeals.map((combo: any) => (
                  <ProductCard key={combo.id} product={combo} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Customer Testimonials */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
                {t("testimonials.title")}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                {t("testimonials.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  "সুন্দরবনের কাঁচা মধুটির স্বাদ এবং ঘ্রাণ অসাধারণ। বাজারের চিনিযুক্ত মধুর চেয়ে অনেক গুণ ভালো। প্যাকেজিংও খুব প্রিমিয়াম।"
                </p>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">ডাঃ রাশেদ করিম (ধানমন্ডি)</span>
                  <span className="text-emerald-700 text-[11px] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("testimonials.verified")}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  "ঐতিহ্যবাহী কাঠের ঘানির সরিষার তেলের ঝাঁঝ দারুণ! অর্ডারের মাত্র ৫ ঘণ্টায় উত্তরায় হোম ডেলিভারি পেয়েছি।"
                </p>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">নুসরাত জাহান (উত্তরা)</span>
                  <span className="text-emerald-700 text-[11px] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("testimonials.verified")}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  "গাওয়া ঘির দানা ও খাঁটি মিষ্টি সুবাস পুরো রান্নাঘরে ছড়িয়ে পড়ে। প্রতিটি স্ট্যাটাস পরিবর্তনের লাইভ SMS ট্র্যাকিং সত্যিই প্রশংসনীয়।"
                </p>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">তানভীর আহমেদ (মিরপুর)</span>
                  <span className="text-emerald-700 text-[11px] flex items-center gap-1 font-semibold">
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
