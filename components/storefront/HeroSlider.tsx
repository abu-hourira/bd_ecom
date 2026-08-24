"use client";
// components/storefront/HeroSlider.tsx - Polished Mobile & Desktop Hero Carousel

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { getSafeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  targetCategory?: string | null;
  badgeText?: string | null;
  displayOrder: number;
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

  const activeBanners = (banners || []).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeBanners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 bg-stone-900 group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Carousel Aspect Ratio */}
      <div className="relative w-full aspect-[16/8] sm:aspect-[21/9] md:aspect-[2.4/1]">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          const targetUrl = banner.targetCategory
            ? `/products?category=${banner.targetCategory}`
            : "/products";

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
                  src={getSafeImageUrl(banner.imageUrl)}
                  alt={banner.title || "Promotion Banner"}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />

                {/* Subtle Gradient Shadow for readability */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3.5 sm:p-8 md:p-10">
                    <div className="max-w-xl space-y-1 sm:space-y-2 text-white">
                      {banner.badgeText && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-extrabold text-[9px] sm:text-xs uppercase tracking-wider shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 text-stone-950" />
                          <span>{banner.badgeText}</span>
                        </span>
                      )}

                      {banner.title && (
                        <h2 className="text-sm sm:text-2xl md:text-3xl font-display font-bold leading-tight drop-shadow-md text-white">
                          {banner.title}
                        </h2>
                      )}

                      {banner.subtitle && (
                        <p className="text-[10px] sm:text-sm text-white/90 line-clamp-1 sm:line-clamp-2 drop-shadow-sm">
                          {banner.subtitle}
                        </p>
                      )}

                      <div className="pt-1 sm:pt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-300 hover:text-amber-200 group-hover:underline">
                          <span>{locale === "bn" ? "অফার দেখুন" : "Explore Offers"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
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
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {activeBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  resetTimer();
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex ? "w-5 bg-amber-400" : "w-1.5 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
