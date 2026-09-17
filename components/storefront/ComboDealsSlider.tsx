"use client";
// components/storefront/ComboDealsSlider.tsx - 3-Item Side-by-Side Auto-Sliding Carousel for Combos & Specials

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { useLanguage } from "@/context/LanguageContext";

interface ComboDealsSliderProps {
  comboDeals: any[];
  onQuickView?: (product: any) => void;
}

export default function ComboDealsSlider({
  comboDeals,
  onQuickView,
}: ComboDealsSliderProps) {
  const { locale } = useLanguage();
  const isBn = locale === "bn";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const slideLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.85;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const slideRight = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.85;
    if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 15) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [comboDeals, checkScroll]);

  // Auto-slide every 4 seconds unless hovered/touched
  useEffect(() => {
    if (isHovered || !comboDeals || comboDeals.length <= 3) return;
    const timer = setInterval(() => {
      slideRight();
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, comboDeals, slideRight]);

  if (!comboDeals || comboDeals.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="bg-gradient-to-br from-[#F7F4EE] via-[#FAF7F2] to-[#EFEAE1] p-3 sm:p-6 lg:p-8 rounded-2xl sm:rounded-4xl border border-amber-200/70 shadow-card space-y-3 sm:space-y-4 relative overflow-hidden"
      >
        {/* Header with Title and Slide Controls */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[9.5px] sm:text-xs font-black tracking-wider uppercase shadow-2xs flex items-center gap-1">
                <Flame className="w-3 h-3 fill-stone-950 text-stone-950" />
                <span>{isBn ? "স্পেশাল কম্বো অফার" : "Special Bundles"}</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-amber-900">
                {isBn ? "(১৯% পর্যন্ত বিশেষ সাশ্রয়)" : "(Up to 19% Savings)"}
              </span>
            </div>

            <h2 className="text-sm sm:text-2xl font-bold font-display text-stone-900 mt-1">
              {isBn ? "সাশ্রয়ী ফ্যামিলি কম্বো প্যাকেজ" : "Super Saver Family Combos"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View All Link */}
            <Link
              href="/products?category=frozen-combo-packs"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline cursor-pointer mr-2"
            >
              <span>{isBn ? "সব দেখুন" : "View All"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Slider Navigation Arrows */}
            {comboDeals.length > 3 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={slideLeft}
                  disabled={!canScrollLeft}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-stone-800 hover:bg-forest hover:text-white border border-stone-200/80 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                  aria-label="Previous items"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={slideRight}
                  disabled={!canScrollRight}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-stone-800 hover:bg-forest hover:text-white border border-stone-200/80 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                  aria-label="Next items"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-Item Side-by-Side Sliding Rail */}
        <div className="relative -mx-1 px-1">
          <div
            ref={scrollContainerRef}
            className="flex gap-1.5 sm:gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {comboDeals.map((combo: any) => (
              <div
                key={combo.id}
                className="snap-start shrink-0 w-[calc(33.333%-4px)] min-w-[102px] sm:w-[calc(33.333%-10px)] md:w-[calc(25%-11px)] lg:w-[calc(20%-12px)]"
              >
                <ProductCard product={combo} onQuickView={onQuickView} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View All Footer Link */}
        <div className="sm:hidden text-center pt-1 border-t border-amber-200/60">
          <Link
            href="/products?category=frozen-combo-packs"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-forest hover:underline"
          >
            <span>{isBn ? "সকল স্পেশাল কম্বো দেখুন" : "View All Special Combos"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
