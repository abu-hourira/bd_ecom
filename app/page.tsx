"use client";
// app/page.tsx - Modern Storefront with Dynamic Ads & Banner Slider

import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import HeroSlider from "@/components/storefront/HeroSlider";
import ProductCard from "@/components/storefront/ProductCard";
import { formatTaka } from "@/lib/utils";
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
  const banners = data?.banners || [];

  const filteredProducts =
    selectedCategoryTab === "all"
      ? products
      : products.filter((p: any) => p.category?.slug === selectedCategoryTab);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="space-y-6 sm:space-y-12 pb-24 md:pb-20">
        {/* 1. Dynamic Top Ad Banners & Promo Slider (Instant Visual Wow on Mobile & Desktop) */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
          <HeroSlider banners={banners} />
        </section>

        {/* 2. Fast Horizontal Category Story-Bar (Instant Access on Mobile) */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2.5">
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

          <div className="flex items-center gap-2 sm:gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x">
            {/* All Category Pill */}
            <button
              onClick={() => setSelectedCategoryTab("all")}
              className={`snap-start shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
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
                  className={`snap-start shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
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
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
            <div>
              <h2 className="text-base sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span>{t("products.title")}</span>
              </h2>
              <p className="text-xs text-stone-500 hidden sm:block">
                {t("products.subtitle")}
              </p>
            </div>

            <span className="text-[11px] sm:text-xs font-mono font-bold text-forest bg-forest-soft px-2.5 py-0.5 sm:py-1 rounded-full border border-forest/15">
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
          <div className="text-center pt-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-emerald-50 text-forest font-bold text-xs sm:text-sm border border-forest/30 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{t("products.viewFull")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* 4. Family Combo & Bundle Deals */}
        {comboDeals.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="bg-[#F7F4EE] p-4 sm:p-8 rounded-3xl border border-stone-200/80 space-y-3.5 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold tracking-wider uppercase">
                    {t("combos.badge")}
                  </span>
                  <h2 className="text-base sm:text-2xl font-bold font-display text-stone-900 mt-1">
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
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="text-center max-w-xl mx-auto space-y-0.5">
              <h2 className="text-base sm:text-2xl font-bold font-display text-stone-900">
                {t("testimonials.title")}
              </h2>
              <p className="text-xs text-stone-600">
                {t("testimonials.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
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

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
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

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
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
