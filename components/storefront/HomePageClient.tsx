"use client";
// components/storefront/HomePageClient.tsx - Ultra-Advanced World-Class Dynamic Storefront

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  ArrowRight,
  Sparkles,
  Flame,
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
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import HeroSlider from "@/components/storefront/HeroSlider";
import ProductCard from "@/components/storefront/ProductCard";
import QuickViewModal from "@/components/storefront/QuickViewModal";
import { ProductCardSkeleton } from "@/components/storefront/ProductCardSkeleton";
import { useLanguage } from "@/context/LanguageContext";
import { setCachedHomeData } from "@/lib/storeCache";

export default function HomePageClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState<any>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData?.featuredProducts?.length);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  // Flash Deal Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const filteredProducts =
    selectedCategoryTab === "all"
      ? products
      : products.filter((p: any) => p.category?.slug === selectedCategoryTab);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between overflow-x-hidden">
      <StorefrontHeader />

      <main className="space-y-6 sm:space-y-12 pb-24 md:pb-20">
        <h1 className="sr-only">
          ENMAR — 100% Pure Organic Food & Pantry Essentials | খাঁটি অর্গানিক খাদ্য বাংলাদেশ
        </h1>

        {/* 1. Dynamic Top Ad Banners or Brand Spotlight */}
        {banners && banners.length > 0 ? (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
            <HeroSlider banners={banners} />
          </div>
        ) : (
          /* Brand Spotlight Showcase */
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
            <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#092C15] via-[#0F4A24] to-[#1B6334] text-white p-6 sm:p-12 shadow-2xl border border-forest-light/30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? "১০০% খাঁটি ও নির্ভেজাল পণ্য" : "100% Pure & Organic"}</span>
                </div>

                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold font-display leading-tight text-white drop-shadow-sm">
                  {isBn
                    ? "সুস্থ ও দীর্ঘায়ু জীবনের জন্য সেরা অর্গানিক খাদ্য"
                    : "Pure Organic Essentials For Your Healthy Life"}
                </h2>

                <p className="text-xs sm:text-base text-white/85 leading-relaxed max-w-xl">
                  {isBn
                    ? "সরাসরি মাঠ ও প্রাকৃতিক মৌচাক থেকে সংগৃহীত খাঁটি খাদ্যপণ্য পৌঁছে দিচ্ছি আপনার দোরগোড়ায়।"
                    : "Delivering chemical-free, farm-fresh organic food and pantry staples directly to your doorstep."}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{isBn ? "পণ্যসমূহ দেখুন" : "Shop All Products"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/track"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  >
                    <span>{isBn ? "অর্ডার ট্র্যাক করুন" : "Track Order"}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Flash Deal / Daily Specials Ticker Bar */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-stone-950 px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="p-1.5 rounded-xl bg-stone-950 text-amber-400">
                <Flame className="w-4 h-4 fill-current" />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
                  {isBn ? "🔥 আজকের বিশেষ অফার — সীমিত সময়ের সুযোগ!" : "🔥 Flash Harvest Deal — Limited Time!"}
                </span>
                <span className="hidden md:inline-block text-[11px] font-semibold text-stone-900 ml-2">
                  {isBn ? "(৳২,৫০০+ অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি)" : "(Free delivery on ৳2,500+)"}
                </span>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 font-mono text-xs font-black">
              <span className="px-2 py-1 bg-stone-950 text-white rounded-lg">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="font-bold">:</span>
              <span className="px-2 py-1 bg-stone-950 text-white rounded-lg">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="font-bold">:</span>
              <span className="px-2 py-1 bg-stone-950 text-amber-400 rounded-lg animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Trust Value Propositions Bar (4 Key Trust Pillars) */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-card flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-forest shrink-0">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                  {isBn ? "১০০% খাঁটি পণ্য" : "100% Organic"}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5">
                  {isBn ? "কোনো রাসায়নিক নেই" : "No harmful chemicals"}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-card flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                  {isBn ? "সারা দেশে ডেলিভারি" : "Fast Delivery"}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5">
                  {isBn ? "২৪-৪৮ ঘণ্টার মধ্যে" : "Across Bangladesh"}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-card flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                  {isBn ? "ক্যাশ অন ডেলিভারি" : "Cash On Delivery"}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5">
                  {isBn ? "পণ্য দেখে মূল্য দিন" : "Pay at doorstep"}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-card flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <RotateCcw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                  {isBn ? "সহজ রিটার্ন সুবিধা" : "Easy Returns"}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5">
                  {isBn ? "শতভাগ সন্তুষ্টি" : "100% Satisfaction"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Dynamic Categories Filter Slider */}
        {categories && categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest" />
                <span>{isBn ? "পণ্য ক্যাটাগরি" : "Categories"}</span>
              </h2>
              <Link
                href="/products"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <span>{isBn ? "সবগুলো দেখুন" : "View All"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {/* All Category Pill */}
              <button
                onClick={() => setSelectedCategoryTab("all")}
                className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                  selectedCategoryTab === "all"
                    ? "bg-forest text-white border-forest shadow-md shadow-forest/20 scale-105"
                    : "bg-white text-stone-700 border-stone-200 hover:border-forest/40 shadow-xs"
                }`}
              >
                <Leaf className="w-4 h-4 text-amber-400" />
                <span>{isBn ? "সকল পণ্য" : "All Products"}</span>
              </button>

              {/* Dynamic DB Categories */}
              {categories.map((c: any) => {
                const isSelected = selectedCategoryTab === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryTab(c.slug)}
                    className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? "bg-forest text-white border-forest shadow-md shadow-forest/20 scale-105"
                        : "bg-white text-stone-700 border-stone-200 hover:border-forest/40 shadow-xs"
                    }`}
                  >
                    <span>{c.name}</span>
                    {c._count?.products ? (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                        {c._count.products}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Main Product Grid & Loading States */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/90 pb-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 fill-red-500" />
                <span>{isBn ? "জনপ্রিয় অর্গানিক পণ্যসমূহ" : "Featured Organic Products"}</span>
              </h2>
            </div>

            {filteredProducts.length > 0 && (
              <span className="text-[11px] sm:text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded-full border border-forest/20">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            /* Rendered Live DB Products */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#0F4A24] to-[#1B6334] hover:from-[#0A381A] hover:to-[#0F4A24] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-forest/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{isBn ? "সকল পণ্য দেখুন" : "View All Products"}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          )}
        </section>

        {/* 6. Family Combo & Bundle Deals (If combos exist in DB) */}
        {comboDeals && comboDeals.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#F7F4EE] to-[#EFEAE1] p-5 sm:p-10 rounded-3xl sm:rounded-4xl border border-stone-200/90 shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-xs">
                    {isBn ? "🔥 স্পেশাল কম্বো অফার" : "Special Bundles"}
                  </span>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold font-display text-stone-900 mt-2">
                    {isBn ? "সাশ্রয়ী ফ্যামিলি কম্বো প্যাকেজ" : "Super Saver Family Combos"}
                  </h2>
                </div>

                <Link
                  href="/products?category=combo-bundle-deals"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-forest hover:underline cursor-pointer"
                >
                  <span>{isBn ? "সব দেখুন" : "View All"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {comboDeals.map((combo: any) => (
                  <ProductCard
                    key={combo.id}
                    product={combo}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7. Why Choose ENMAR / Organic Guarantee Section */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-12 border border-stone-200/90 shadow-card">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-forest bg-forest-soft px-3 py-1 rounded-full border border-forest/15">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                <span>{isBn ? "আমাদের বিশুদ্ধতার অঙ্গীকার" : "Our Purity Guarantee"}</span>
              </span>
              <h2 className="text-xl sm:text-3xl font-bold font-display text-stone-900">
                {isBn ? "কেন ENMAR অর্গানিক ফুড বেছে নেবেন?" : "Why Choose ENMAR Organics?"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                {isBn
                  ? "আমরা শুধু খাবার বিক্রি করি না, নিশ্চিত করি আপনার পরিবারের সুস্বাস্থ্য ও শতভাগ প্রাকৃতিক পুষ্টি।"
                  : "We believe pure, unadulterated food is the foundation of a vibrant and healthy life."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#F8F6F2] border border-stone-200/70 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-forest text-amber-400 flex items-center justify-center font-bold">
                  🌱
                </div>
                <h3 className="font-bold font-display text-base text-stone-900">
                  {isBn ? "সরাসরি মাঠ ও প্রাকৃতিক উৎস" : "Direct Farm Sourcing"}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isBn
                    ? "সুন্দরবনের মৌয়াল ও প্রান্তিক চাষীদের থেকে কোনো মধ্যস্বত্বভোগী ছাড়াই খাঁটি উপাদান সংগ্রহ করা হয়।"
                    : "Sourced directly from certified organic beekeepers and sustainable traditional farmers."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8F6F2] border border-stone-200/70 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-forest text-amber-400 flex items-center justify-center font-bold">
                  🧪
                </div>
                <h3 className="font-bold font-display text-base text-stone-900">
                  {isBn ? "ল্যাব টেস্টেড ১০০% বিশুদ্ধ" : "Lab Tested Purity"}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isBn
                    ? "প্রতিটি ব্যাচের মধু, সরিষার তেল ও গাওয়া ঘি মান নিয়ন্ত্রক ল্যাব টেস্টের মাধ্যমে যাচাই করা হয়।"
                    : "Every harvest is tested for moisture, pure sucrose levels, and absolute chemical freedom."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8F6F2] border border-stone-200/70 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-forest text-amber-400 flex items-center justify-center font-bold">
                  🍯
                </div>
                <h3 className="font-bold font-display text-base text-stone-900">
                  {isBn ? "ফুড-গ্রেড নিরাপদ প্যাকেজিং" : "Eco Glass Packaging"}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isBn
                    ? "স্বাস্থ্যসম্মত কাঁচের জার ও লিক-প্রুফ ফুড-গ্রেড প্যাকেজিং নিশ্চিত করে আসল স্বাদ ও সুবাস।"
                    : "Packed in premium food-grade airtight glass containers to preserve aroma and enzymes."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Customer Reviews / Social Proof Showcase */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#092C15] to-[#0F4A24] text-white rounded-3xl sm:rounded-4xl p-6 sm:p-12 shadow-xl">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center gap-1 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="ml-1 text-white">৫.০ / ৫.০ রেটিং</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold font-display text-white">
                {isBn ? "গ্রাহকদের সন্তুষ্টি ও অভিজ্ঞতা" : "What Our Happy Customers Say"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  name: "আহমেদ তানভীর",
                  city: "ধানমন্ডি, ঢাকা",
                  comment: "সুন্দরবনের চাকভাঙা মধুটা আসলেই অসাধারণ! স্বাদ ও ঘ্রাণে শতভাগ খাঁটি। খুব দ্রুত ডেলিভারি পেয়েছি।",
                  product: "সুন্দরবনের চাকভাঙা কাঁচা মধু",
                },
                {
                  name: "ফারহানা ইয়াসমিন",
                  city: "উত্তরা, ঢাকা",
                  comment: "ঘানিতে ভাঙা সরিষার তেল ও ঘি দুটোর কোয়ালিটি চমৎকার। রান্নায় আসল ঘরোয়া ঘ্রাণ পাওয়া যায়।",
                  product: "গাওয়া ঘি ও সরিষার তেল",
                },
                {
                  name: "মোঃ রফিকুল ইসলাম",
                  city: "চট্টগ্রাম",
                  comment: "ক্যাশ অন ডেলিভারিতে চেক করে নিয়েছি। প্যাকেজিং খুবই নিরাপদ ছিল। নিয়মিত নেব ইনশাআল্লাহ।",
                  product: "ফ্যামিলি সুপার কম্বো প্যাক",
                },
              ].map((rev, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                      <span className="text-[10px] text-white/70">{rev.city}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-amber-300 font-medium">
                      ভেরিফাইড ক্রেতা
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <StorefrontFooter />
    </div>
  );
}
