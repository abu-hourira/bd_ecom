"use client";
// components/storefront/HeroSlider.tsx - 100% Dynamic Database-Driven Slider

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { getSafeImageUrl } from "@/lib/utils";

interface BannerItem {
  id?: number | string;
  title: string;
  headline?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  targetLink?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  isActive?: boolean;
}

interface HeroSliderProps {
  banners?: BannerItem[];
}

export default function HeroSlider({ banners = [] }: HeroSliderProps) {
  const activeBanners = banners && banners.length > 0 ? banners.filter((b) => b.isActive !== false) : [];

  // If no banners uploaded by admin, do not render default placeholder banners
  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto slide every 4.5 seconds
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentIndex, activeBanners.length]);

  const startAutoPlay = () => {
    stopAutoPlay();
    if (activeBanners.length <= 1) return;
    autoPlayRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
  };

  const nextSlide = () => {
    stopAutoPlay();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    stopAutoPlay();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoPlay();
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(null);
    setTouchEnd(null);
    startAutoPlay();
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-stone-900 rounded-2xl sm:rounded-3xl shadow-lg group"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.4/1] min-h-[190px] sm:min-h-[280px]">
        {activeBanners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          const target = banner.targetLink || "/products";

          return (
            <div
              key={banner.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-stone-950">
                <Image
                  src={getSafeImageUrl(banner.imageUrl)}
                  alt={banner.title}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
              </div>

              {/* Banner Text Content */}
              <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-10 lg:px-14 max-w-2xl text-white space-y-1.5 sm:space-y-3">
                {banner.headline && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] sm:text-xs font-black tracking-wide w-fit uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>{banner.headline}</span>
                  </div>
                )}

                <h2 className="text-base sm:text-2xl lg:text-4xl font-bold font-display text-white leading-tight drop-shadow-sm line-clamp-2">
                  {banner.title}
                </h2>

                {banner.subtitle && (
                  <p className="text-[11px] sm:text-xs lg:text-sm text-stone-200 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-lg">
                    {banner.subtitle}
                  </p>
                )}

                <div className="pt-1 sm:pt-2">
                  <Link
                    href={target}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer w-fit"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>অর্ডার করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  stopAutoPlay();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex ? "w-5 sm:w-6 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
