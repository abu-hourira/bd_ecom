"use client";
// components/storefront/VerifiedPhotoReviews.tsx - Customer Verified Photo Reviews Auto-Sliding Carousel

import { useState, useRef, useEffect, useCallback } from "react";
import { Star, CheckCircle2, Camera, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PhotoReview {
  id: number;
  name: string;
  location: string;
  rating: number;
  productName: string;
  comment: string;
  timeAgo: string;
  photo: string;
  likes: number;
}

const PHOTO_REVIEWS: PhotoReview[] = [
  {
    id: 1,
    name: "ফারহানা সুলতানা",
    location: "ধানমন্ডি, ঢাকা",
    rating: 5,
    productName: "লাল আটার ফ্রোজেন রুটি (২০ পিস)",
    comment: "তাওয়ায় সেকার সাথে সাথেই ফুলকো নরম হয়ে গেল। পরিবারের সবাই খুব পছন্দ করেছে।",
    timeAgo: "গতকাল",
    photo: "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
    likes: 42,
  },
  {
    id: 2,
    name: "মাহমুদুল হাসান",
    location: "উত্তরা, ঢাকা",
    rating: 5,
    productName: "চিকেন মোমো (১২ পিস)",
    comment: "একদম রেস্টুরেন্ট কোয়ালিটি। ৫ মিনিট ভাপ দেওয়ার পর ভেতরটা রসালো ছিল।",
    timeAgo: "২ দিন আগে",
    photo: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
    likes: 38,
  },
  {
    id: 3,
    name: "তানজিলা আক্তার",
    location: "মিরপুর-১০, ঢাকা",
    rating: 5,
    productName: "চিকেন স্প্রিং রোল (১০ পিস)",
    comment: "বিকেলের নাস্তায় মেহমানদের ভেজে দিয়েছিলাম, বাইরে ক্রিস্পি ভেতরে দারুণ স্বাদ।",
    timeAgo: "৩ দিন আগে",
    photo: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
    likes: 29,
  },
  {
    id: 4,
    name: "সাদিয়া চৌধুরী",
    location: "বনানী, ঢাকা",
    rating: 5,
    productName: "ঘরোয়া খাস্তা সিঙ্গারা (১০ পিস)",
    comment: "কালোজিরার ফ্লেভার আর আলুর পুর পারফেক্ট। ডিপ ফ্রিজে রাখলেও জড়ায়নি।",
    timeAgo: "৪ দিন আগে",
    photo: "/uploads/upload-1787287646578-7y92p_1000019649.jpg",
    likes: 35,
  },
  {
    id: 5,
    name: "নাজমুল হোসেন",
    location: "মোহাম্মদপুর, ঢাকা",
    rating: 5,
    productName: "সাদা আটার ফ্রোজেন রুটি (২০ পিস)",
    comment: "সকালের অফিস তাড়াহুড়োয় এটা লাইফ সেভার! ৩০ সেকেন্ডে গরম রুটি তৈরি।",
    timeAgo: "৫ দিন আগে",
    photo: "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
    likes: 26,
  },
  {
    id: 6,
    name: "শারমিন জাহান",
    location: "গুলশান-২, ঢাকা",
    rating: 5,
    productName: "ঝাল পুলি পিঠা (১০ পিস)",
    comment: "ঘরোয়া পিঠার মতো খাস্তা আর স্বাদে সেরা। ফ্রোজেন অবস্থায় ভাজা যায় খুব সহজে।",
    timeAgo: "১ সপ্তাহ আগে",
    photo: "/uploads/upload-1787287646578-7y92p_1000019649.jpg",
    likes: 31,
  },
];

export default function VerifiedPhotoReviews() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const [likesState, setLikesState] = useState<{ [key: number]: number }>(
    PHOTO_REVIEWS.reduce((acc, r) => ({ ...acc, [r.id]: r.likes }), {})
  );
  const [likedMap, setLikedMap] = useState<{ [key: number]: boolean }>({});

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const slideLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const slideRight = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
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
  }, [checkScroll]);

  // Auto-Slide Interval
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      slideRight();
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, slideRight]);

  const handleLike = (id: number) => {
    if (likedMap[id]) return;
    setLikesState((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    setLikedMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3.5">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="bg-white rounded-2xl p-3 sm:p-5 border border-stone-200/90 shadow-sm space-y-3"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[9.5px] sm:text-[10.5px] uppercase tracking-wider mb-0.5">
              <Camera className="w-3 h-3 text-amber-700" />
              <span>{isBn ? "গ্রাহকদের রিভিউ" : "Customer Reviews"}</span>
            </div>
            <h2 className="text-xs sm:text-base md:text-lg font-bold font-display text-stone-900">
              {isBn ? "ভেরিফাইড ক্রেতাদের আসল অভিজ্ঞতা ও ছবি" : "Verified Customer Experience & Photos"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Rating Summary Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-[10.5px] font-bold text-emerald-900 font-mono">
                ৪.৯ / ৫.০ (৫০০+)
              </span>
            </div>

            {/* Slider Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={slideLeft}
                disabled={!canScrollLeft}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-stone-100 text-stone-800 hover:bg-forest hover:text-white border border-stone-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={slideRight}
                disabled={!canScrollRight}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-stone-100 text-stone-800 hover:bg-forest hover:text-white border border-stone-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Item Side-by-Side Sliding Rail */}
        <div className="relative -mx-1 px-1">
          <div
            ref={scrollContainerRef}
            className="flex gap-1.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {PHOTO_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="snap-start shrink-0 w-[calc(33.333%-4px)] min-w-[105px] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-10px)] bg-[#FAF8F5] rounded-xl p-1.5 sm:p-2 border border-stone-200 flex flex-col justify-between hover:shadow-xs transition-all duration-300 group"
              >
                <div className="space-y-1">
                  {/* Photo Thumbnail - Square aspect-square matching top Product Cards */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.photo}
                      alt={review.productName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-xs text-amber-300 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      <span>ভেরিফাইড</span>
                    </span>
                  </div>

                  {/* Rating & Product */}
                  <div className="pt-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[8.5px] sm:text-[9px] text-stone-500 font-mono">{review.timeAgo}</span>
                    </div>

                    <h4 className="text-[10px] sm:text-[11px] font-bold text-forest mt-0.5 truncate leading-tight">
                      {review.productName}
                    </h4>

                    <p className="text-[9.5px] sm:text-[10.5px] text-stone-700 mt-0.5 leading-snug italic line-clamp-2">
                      "{review.comment}"
                    </p>
                  </div>
                </div>

                {/* Reviewer Info & Like Button */}
                <div className="pt-1 mt-1 border-t border-stone-200/80 flex items-center justify-between text-[9.5px]">
                  <div className="truncate mr-1">
                    <span className="font-bold text-stone-900 block leading-none truncate text-[9.5px] sm:text-[10px]">{review.name}</span>
                    <span className="text-[8.5px] text-stone-500 truncate block mt-0.5">{review.location}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center gap-0.5 text-[8.5px] sm:text-[9px] font-bold px-1 py-0.5 rounded transition-all cursor-pointer shrink-0 ${
                      likedMap[review.id]
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <ThumbsUp className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${likedMap[review.id] ? "fill-current" : ""}`} />
                    <span className="font-mono">{likesState[review.id]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
