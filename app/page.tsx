"use client";
// app/page.tsx - Instant Zero-Flicker Dynamic Storefront

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  ArrowRight,
  Sparkles,
  Flame,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import HeroSlider from "@/components/storefront/HeroSlider";
import ProductCard from "@/components/storefront/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { getCachedHomeData, setCachedHomeData } from "@/lib/storeCache";

export default function HomePage() {
  // Initialize state immediately from cache if available (instant 0ms render)
  const [data, setData] = useState<any>(() => getCachedHomeData());
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const { t, locale } = useLanguage();

  useEffect(() => {
    // Background silent SWR refresh
    fetch("/api/storefront/home", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
          setCachedHomeData(json);
        }
      })
      .catch((e) => console.error("Silent home sync error:", e));
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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between overflow-x-hidden">
      <StorefrontHeader />

      <main className="space-y-6 sm:space-y-10 pb-24 md:pb-20">
        {/* 1. Dynamic Top Ad Banners & Promo Slider (Instant Render) */}
        {banners && banners.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
            <HeroSlider banners={banners} />
          </section>
        )}

        {/* 2. Horizontal Category Story-Bar */}
        {categories && categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm sm:text-lg font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-forest" />
                <span>{locale === "bn" ? "ক্যাটাগরি" : "Categories"}</span>
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
        )}

        {/* 3. Main Product Grid — Instant Direct Render */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
            <div>
              <h2 className="text-base sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span>{t("products.title")}</span>
              </h2>
            </div>

            {filteredProducts.length > 0 && (
              <span className="text-[11px] sm:text-xs font-mono font-bold text-forest bg-forest-soft px-2.5 py-0.5 sm:py-1 rounded-full border border-forest/15">
                {filteredProducts.length} {locale === "bn" ? "টি পণ্য" : "items"}
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6 space-y-2">
              <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-1" />
              <h3 className="font-bold text-sm text-stone-800 font-display">
                {locale === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No products available"}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {locale === "bn"
                  ? "অ্যাডমিন প্যানেল থেকে নতুন পণ্য যোগ করলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।"
                  : "Products added from admin panel will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="text-center pt-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-emerald-50 text-forest font-bold text-xs sm:text-sm border border-forest/30 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{t("products.viewFull")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
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
      </main>

      <StorefrontFooter />
    </div>
  );
}
