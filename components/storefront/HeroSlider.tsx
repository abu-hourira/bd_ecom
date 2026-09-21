"use client";
// components/storefront/HeroSlider.tsx - Ultra-Polished Mobile & Desktop Hero Carousel

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { getSafeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Banner {
  id: number;
  title: string;
  headline?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  targetLink?: string | null;
  targetCategory?: string | null;
  badgeText?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const { locale } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeBanners = (banners || [])
    .filter(
      (b) =>
        b &&
        b.imageUrl &&
        (b.isActive === undefined || b.isActive === true)
    )
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeBanners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5500);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBanners.length]);

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
    );
    resetTimer();
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl md:rounded-4xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 border border-stone-200/80 bg-stone-900 group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Carousel Aspect Ratio: Ultra-Sleek & Compact (Not dominating the screen) */}
      <div className="relative w-full aspect-[2.3/1] sm:aspect-[2.8/1] md:aspect-[3.2/1] max-h-[170px] sm:max-h-[240px] md:max-h-[300px]">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          const targetUrl =
            banner.targetLink ||
            (banner.targetCategory
              ? `/products?category=${banner.targetCategory}`
              : "/products");
          const safeImageUrl = getSafeImageUrl(banner.imageUrl);
          const isDataUrl = safeImageUrl.startsWith("data:") || safeImageUrl.startsWith("blob:");
          const badge = banner.headline || banner.badgeText;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Link href={targetUrl} className="block relative w-full h-full">
                {/* Banner Background Image */}
                <Image
                  src={safeImageUrl}
                  alt={banner.title || "Promotion Banner"}
                  fill
                  priority={index === 0}
                  unoptimized={isDataUrl}
                  className="object-cover object-center transform transition-transform duration-7000 ease-out scale-100 group-hover:scale-103"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                />

                {/* Elegant subtle gradient overlay only on bottom text area */}
                {(banner.title || banner.subtitle || badge) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-6 md:p-8">
                    <div className="max-w-md sm:max-w-lg space-y-1 text-white">
                      {badge && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-extrabold text-[8px] sm:text-[10px] uppercase tracking-wider shadow-xs w-fit">
                          <Sparkles className="w-2.5 h-2.5 text-stone-950" />
                          <span>{badge}</span>
                        </span>
                      )}

                      {banner.title && (
                        <h2 className="text-xs sm:text-lg md:text-xl font-display font-bold leading-snug drop-shadow-sm text-white line-clamp-1">
                          {banner.title}
                        </h2>
                      )}

                      {banner.subtitle && (
                        <p className="hidden sm:block text-[11px] md:text-xs text-stone-200/90 line-clamp-1 drop-shadow-xs">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Desktop Arrow Navigation */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  resetTimer();
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-4 bg-amber-400"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
