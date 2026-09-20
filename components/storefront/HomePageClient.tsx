"use client";
// components/storefront/HomePageClient.tsx - Ultra-Advanced World-Class Dynamic Storefront

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Leaf,
  ArrowRight,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Loader2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  Zap,
  Star,
  Clock,
  CheckCircle2,
  Heart,
  Eye,
  MessageCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import HeroSlider from "@/components/storefront/HeroSlider";
import ProductCard from "@/components/storefront/ProductCard";
import { ProductCardSkeleton } from "@/components/storefront/ProductCardSkeleton";
import MealTimeFilterBar from "@/components/storefront/MealTimeFilterBar";
import { useLanguage } from "@/context/LanguageContext";
import { setCachedHomeData } from "@/lib/storeCache";

const QuickViewModal = dynamic(
  () => import("@/components/storefront/QuickViewModal"),
  { ssr: false }
);
const ComboDealsSlider = dynamic(
  () => import("@/components/storefront/ComboDealsSlider"),
  { ssr: false }
);
const CustomComboBuilder = dynamic(
  () => import("@/components/storefront/CustomComboBuilder"),
  { ssr: false }
);
const InteractiveCookingGuide = dynamic(
  () => import("@/components/storefront/InteractiveCookingGuide"),
  { ssr: false }
);
const PartySnackCalculator = dynamic(
  () => import("@/components/storefront/PartySnackCalculator"),
  { ssr: false }
);

function getCategoryEmoji(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("মধু") || n.includes("honey")) return "🍯";
  if (n.includes("ঘি") || n.includes("ghee")) return "🧈";
  if (n.includes("তেল") || n.includes("oil")) return "🌱";
  if (n.includes("খেজুর") || n.includes("date")) return "🌴";
  if (n.includes("মসলা") || n.includes("spice")) return "🌶️";
  if (n.includes("চাল") || n.includes("ডাল") || n.includes("rice") || n.includes("dal")) return "🌾";
  if (n.includes("বাদাম") || n.includes("nut") || n.includes("seed")) return "🥜";
  if (n.includes("চা") || n.includes("কফি") || n.includes("tea") || n.includes("coffee")) return "☕";
  if (n.includes("ফ্রোজেন") || n.includes("frozen") || n.includes("মোমো") || n.includes("পরোটা")) return "🥟";
  if (n.includes("কম্বো") || n.includes("combo") || n.includes("deal")) return "🎁";
  return "🌿";
}

export default function HomePageClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState<any>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData?.featuredProducts?.length);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [selectedMeal, setSelectedMeal] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const { locale } = useLanguage();
  const isBn = locale === "bn";


  // Category slider refs & scroll logic
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(true);
  const [isCatHovered, setIsCatHovered] = useState(false);

  const checkCatScroll = useCallback(() => {
    if (!catScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catScrollRef.current;
    setCanScrollCatLeft(scrollLeft > 10);
    setCanScrollCatRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const slideCatLeft = () => {
    if (!catScrollRef.current) return;
    const container = catScrollRef.current;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const slideCatRight = useCallback(() => {
    if (!catScrollRef.current) return;
    const container = catScrollRef.current;
    const scrollAmount = container.clientWidth * 0.7;
    if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 15) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    checkCatScroll();
    const el = catScrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkCatScroll, { passive: true });
      window.addEventListener("resize", checkCatScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkCatScroll);
      window.removeEventListener("resize", checkCatScroll);
    };
  }, [checkCatScroll]);

  // Auto-Slide categories every 4.5 seconds
  useEffect(() => {
    if (isCatHovered) return;
    const timer = setInterval(() => {
      slideCatRight();
    }, 4500);
    return () => clearInterval(timer);
  }, [isCatHovered, slideCatRight]);

  useEffect(() => {
    if (initialData?.featuredProducts?.length) {
      setCachedHomeData(initialData);
      setLoading(false);
      return;
    }

    // Dynamic SWR fetch from live database API
    fetch("/api/storefront/home")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
          setCachedHomeData(json);
        }
      })
      .catch((e) => console.error("Home sync error:", e))
      .finally(() => setLoading(false));
  }, [initialData]);

  const categories = data?.categories || [];
  const products = data?.featuredProducts || [];
  const comboDeals = data?.comboDeals || [];
  const banners = data?.banners || [];

  const filteredProducts = products.filter((p: any) => {
    // 1. Category Tab Filter
    if (selectedCategoryTab !== "all" && p.category?.slug !== selectedCategoryTab) {
      return false;
    }
    // 2. Meal Time Filter
    if (selectedMeal === "breakfast") {
      const n = (p.name || "").toLowerCase();
      return n.includes("রুটি") || n.includes("roti") || n.includes("পরোটা");
    }
    if (selectedMeal === "evening") {
      const n = (p.name || "").toLowerCase();
      return n.includes("মোমো") || n.includes("রোল") || n.includes("সিঙ্গারা") || n.includes("সমুচা") || n.includes("পিঠা");
    }
    if (selectedMeal === "tiffin") {
      const n = (p.name || "").toLowerCase();
      return n.includes("মোমো") || n.includes("রোল");
    }
    if (selectedMeal === "combo") {
      const n = (p.name || "").toLowerCase();
      return n.includes("কম্বো") || n.includes("combo") || p.isCombo;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between overflow-x-hidden selection:bg-forest selection:text-white">
      <StorefrontHeader />

      <main className="space-y-4 sm:space-y-8 pb-20 md:pb-16">
        <h1 className="sr-only">
          ENMAR — 100% Pure Organic Food & Pantry Essentials | খাঁটি অর্গানিক খাদ্য বাংলাদেশ
        </h1>

        {/* Dynamic Top Ad Banners or Brand Spotlight */}
        {banners && banners.length > 0 && (
          <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-4">
            <HeroSlider banners={banners} />
          </div>
        )}


        {/* 4. Dynamic Categories & Fast Filter Rail (With Slide Controls & Auto-Slide) */}
        {categories && categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold font-display text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>{isBn ? "পণ্য ক্যাটাগরি" : "Categories"}</span>
              </h2>

              <div className="flex items-center gap-2">
                <Link
                  href="/products"
                  className="text-[10.5px] sm:text-xs font-bold text-forest hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{isBn ? "সবগুলো দেখুন" : "View All"}</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>

                {/* Category Slider Arrow Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={slideCatLeft}
                    disabled={!canScrollCatLeft}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-stone-700 hover:bg-forest hover:text-white border border-stone-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Previous categories"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={slideCatRight}
                    disabled={!canScrollCatRight}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-stone-700 hover:bg-forest hover:text-white border border-stone-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Next categories"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Smooth Edge-to-Edge Scrollable Filter Strip */}
            <div
              onMouseEnter={() => setIsCatHovered(true)}
              onMouseLeave={() => setIsCatHovered(false)}
              onTouchStart={() => setIsCatHovered(true)}
              onTouchEnd={() => setIsCatHovered(false)}
              className="relative -mx-3 px-3 sm:-mx-0 sm:px-0"
            >
              <div
                ref={catScrollRef}
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x scroll-smooth"
              >
                {/* All Category Pill */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryTab("all");
                    setSelectedMeal("all");
                  }}
                  className={`snap-start shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
                    selectedCategoryTab === "all" && selectedMeal === "all"
                      ? "bg-forest text-amber-300 border-forest shadow-xs font-extrabold"
                      : "bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-[#FBF4EA]"
                  }`}
                >
                  <Leaf className="w-3 h-3 text-amber-400" />
                  <span>{isBn ? "সকল পণ্য" : "All Products"}</span>
                  {products.length > 0 && (
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-mono bg-black/20 text-amber-200">
                      {products.length}
                    </span>
                  )}
                </button>

                {/* Dynamic DB Categories */}
                {categories.map((c: any) => {
                  const isSelected = selectedCategoryTab === c.slug;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryTab(c.slug);
                        setSelectedMeal("all");
                      }}
                      className={`snap-start shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? "bg-forest text-amber-300 border-forest shadow-xs font-extrabold"
                          : "bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-[#FBF4EA]"
                      }`}
                    >
                      <span>{c.name}</span>
                      {c._count?.products ? (
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? "bg-black/20 text-amber-200" : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {c._count.products}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Meal-Time Occasion Filter */}
        <MealTimeFilterBar
          selectedMeal={selectedMeal}
          onSelectMeal={(m) => {
            setSelectedMeal(m);
            if (m !== "all") setSelectedCategoryTab("all");
          }}
        />

        {/* 5. Main Product Grid & Loading States (DIRECTLY HERE!) */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-200/90 pb-2.5">
            <div>
              <h2 className="text-base sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
                <span>{isBn ? "জনপ্রিয় অর্গানিক পণ্যসমূহ" : "Featured Organic Products"}</span>
              </h2>
            </div>

            {filteredProducts.length > 0 && (
              <span className="text-[10px] sm:text-xs font-mono font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
                {filteredProducts.length} {isBn ? "টি পণ্য" : "items"}
              </span>
            )}
          </div>

          {/* If Loading OR 0 products exist in DB: Show Loading Skeletons */}
          {loading || filteredProducts.length === 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 py-4 text-forest font-semibold text-xs sm:text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-forest" />
                <span>{isBn ? "পণ্য লোড হচ্ছে..." : "Loading products from database..."}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-3.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            /* Rendered Live DB Products - 3 side-by-side on mobile */
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-3.5">
              {filteredProducts.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="text-center pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#843A02] via-[#A34E08] to-[#843A02] hover:from-[#5C2B04] hover:to-[#843A02] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-forest/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{isBn ? "সকল পণ্য দেখুন" : "View All Products"}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          )}
        </section>

        {/* 6. Family Combo & Bundle Deals (3-Item Side-by-Side Sliding Carousel) */}
        {comboDeals && comboDeals.length > 0 && (
          <ComboDealsSlider
            comboDeals={comboDeals}
            onQuickView={(prod) => setQuickViewProduct(prod)}
          />
        )}

        {/* 7. Build Your Own Custom Combo Box */}
        <CustomComboBuilder />

        {/* 8. Ready-to-Cook Quick Guide */}
        <InteractiveCookingGuide />

        {/* 9. Smart Party & Guest Snack Calculator */}
        <PartySnackCalculator />

        {/* 10. Why Choose ENMAR / Freshness Guarantee Section */}
        <section className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3.5">
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-stone-200/90 shadow-sm">
            <div className="text-center max-w-xl mx-auto space-y-1 mb-4">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-forest bg-forest-soft px-2.5 py-0.5 rounded-full border border-forest/15">
                <ShieldCheck className="w-3 h-3 text-forest" />
                <span>{isBn ? "আমাদের অঙ্গীকার" : "Our Freshness Guarantee"}</span>
              </span>
              <h2 className="text-sm sm:text-lg font-bold font-display text-stone-900">
                {isBn ? "কেন ENMAR এর ফ্রোজেন খাবার সেরা?" : "Why Choose ENMAR Frozen Foods?"}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                {isBn
                  ? "১০০% ঘরোয়া পরিচ্ছন্নতায় তৈরি ও হিমায়িত, যাতে প্রতিটি কামড়ে পান তাজা ও আসল স্বাদ।"
                  : "Prepared in 100% hygienic home kitchens and flash frozen for authentic taste."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#FBF4EA] border border-stone-200/80 space-y-1.5 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shadow-xs">
                  🌾
                </div>
                <h3 className="font-bold font-display text-xs sm:text-sm text-stone-900">
                  {isBn ? "১০০% খাঁটি লাল ও সাদা আটা" : "100% Pure Wheat Flour"}
                </h3>
                <p className="text-[10.5px] sm:text-[11px] text-stone-600 leading-snug">
                  {isBn
                    ? "কোনো ক্ষতিকর প্রিজারভেটিভ ছাড়া সম্পূর্ণ হাতে তৈরি নরম তুলতুলে রুটি।"
                    : "No chemicals or preservatives. Hand-rolled for maximum softness."}
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-[#FBF4EA] border border-stone-200/80 space-y-1.5 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shadow-xs">
                  🍗
                </div>
                <h3 className="font-bold font-display text-xs sm:text-sm text-stone-900">
                  {isBn ? "জুসি ফ্রেশ চিকেন ও খাঁটি মসলা" : "Fresh Chicken & Pure Spices"}
                </h3>
                <p className="text-[10.5px] sm:text-[11px] text-stone-600 leading-snug">
                  {isBn
                    ? "চিকেন মোমো ও রোলে ব্যবহৃত হয় তাজা ব্রয়লার-মুক্ত চিকেন কিমা ও প্রিমিয়াম মসলা।"
                    : "Packed with juicy minced chicken and rich aromatic natural spices."}
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-[#FBF4EA] border border-stone-200/80 space-y-1.5 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shadow-xs">
                  ❄️
                </div>
                <h3 className="font-bold font-display text-xs sm:text-sm text-stone-900">
                  {isBn ? "ইন্ডিভিজুয়াল ডিপ-ফ্রোজেন প্রযুক্তি" : "Flash-Freeze Technology"}
                </h3>
                <p className="text-[10.5px] sm:text-[11px] text-stone-600 leading-snug">
                  {isBn
                    ? "প্রতিটি পিস আলাদাভাবে ডিপ-ফ্রোজেন করা থাকে, তাই ফ্রিজে একটিও জড়াবে না।"
                    : "Individually frozen so pieces never stick together in the pack."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <StorefrontFooter />
    </div>
  );
}
