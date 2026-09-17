"use client";
// components/storefront/SocialProofToast.tsx - Live Social Proof Ticker for Frozen Foods

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, X, Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface RecentOrderNotice {
  id: number;
  customerName: string;
  location: string;
  productName: string;
  productSlug: string;
  imageSrc: string;
  timeAgo: string;
  quantity: string;
}

const RECENT_ORDERS: RecentOrderNotice[] = [
  {
    id: 1,
    customerName: "ফারহানা আপু",
    location: "ধানমন্ডি, ঢাকা",
    productName: "হাতে তৈরি লাল আটার ফ্রোজেন রুটি",
    productSlug: "handmade-whole-wheat-red-flour-frozen-roti-20pcs",
    imageSrc: "/uploads/upload-1787287847493-t5opy_1000018931.jpg",
    timeAgo: "২ মিনিট আগে",
    quantity: "২ প্যাকেট (৪০ পিস)",
  },
  {
    id: 2,
    customerName: "তৌহিদ ভাই",
    location: "উত্তরা, ঢাকা",
    productName: "পাতা শেইপ প্রিমিয়াম চিকেন মোমো",
    productSlug: "handmade-leaf-shape-chicken-momo-12pcs",
    imageSrc: "/uploads/upload-1787287578589-3cv3w_1000019650.jpg",
    timeAgo: "৪ মিনিট আগে",
    quantity: "১ প্যাকেট (১২ পিস)",
  },
  {
    id: 3,
    customerName: "সুমাইয়া আপু",
    location: "মিরপুর-২, ঢাকা",
    productName: "মুচমুচে ফ্রোজেন চিকেন স্প্রিং রোল",
    productSlug: "crispy-frozen-chicken-spring-rolls-10pcs",
    imageSrc: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
    timeAgo: "৬ মিনিট আগে",
    quantity: "২ প্যাকেট (২০ পিস)",
  },
  {
    id: 4,
    customerName: "তানভীর আহমেদ",
    location: "বনানী, ঢাকা",
    productName: "অল-ইন-ওয়ান ফ্রোজেন ফ্যামিলি মেগা কম্বো",
    productSlug: "all-in-one-frozen-family-mega-combo-box",
    imageSrc: "/uploads/upload-1787287687330-fwbvn_1000019648.jpg",
    timeAgo: "৯ মিনিট আগে",
    quantity: "১টি মেগা কম্বো বক্স",
  },
  {
    id: 5,
    customerName: "নাজনীন সুলতানা",
    location: "মোহাম্মদপুর, ঢাকা",
    productName: "হোমমেড খাস্তা সিঙ্গারা",
    productSlug: "homemade-frozen-shingara-kalojira-10pcs",
    imageSrc: "/uploads/upload-1787287646578-7y92p_1000019649.jpg",
    timeAgo: "১১ মিনিট আগে",
    quantity: "২ প্যাকেট (২০ পিস)",
  },
  {
    id: 6,
    customerName: "রাশেদ চৌধুরী",
    location: "বসুন্ধরা R/A, ঢাকা",
    productName: "হাতে তৈরি সাদা আটার নরম ফ্রোজেন রুটি",
    productSlug: "handmade-white-flour-frozen-roti-20pcs",
    imageSrc: "/uploads/upload-1787287799462-wp72o_1000019010.jpg",
    timeAgo: "১৫ মিনিট আগে",
    quantity: "২ প্যাকেট (৪০ পিস)",
  },
];

export default function SocialProofToast() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show first toast after 4 seconds
    const initialTimer = setTimeout(() => {
      setCurrentIndex(0);
      setIsVisible(true);
    }, 4000);

    // Loop through notices every 14 seconds
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % RECENT_ORDERS.length;
        });
        setIsVisible(true);
      }, 1000); // 1s fade-in delay
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed || currentIndex === null) return null;

  const currentNotice = RECENT_ORDERS[currentIndex];

  return (
    <div
      className={`hidden sm:block fixed bottom-6 left-6 z-30 max-w-sm w-full transition-all duration-500 ease-out pointer-events-auto ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-amber-200/90 shadow-xl shadow-amber-950/10 flex items-center gap-3 relative group">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-900 text-stone-300 hover:text-white flex items-center justify-center shadow-md text-xs cursor-pointer active:scale-90"
          aria-label="Close social proof notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Thumbnail */}
        <Link
          href={`/products/${currentNotice.productSlug}`}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentNotice.imageSrc}
            alt={currentNotice.productName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <span className="absolute bottom-0 inset-x-0 bg-forest/90 text-amber-300 text-[8px] font-black text-center py-0.2">
            অর্ডার
          </span>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-stone-500 mb-0.5">
            <span className="text-forest font-extrabold flex items-center gap-0.5 truncate">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              {currentNotice.customerName}
            </span>
            <span className="text-stone-400">({currentNotice.location})</span>
          </div>

          <Link
            href={`/products/${currentNotice.productSlug}`}
            className="block text-xs sm:text-xs font-bold text-stone-900 hover:text-forest truncate transition-colors"
          >
            {currentNotice.productName}
          </Link>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-stone-600 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded font-medium">
              {currentNotice.quantity}
            </span>
            <span className="text-[9.5px] text-stone-600 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
              {currentNotice.timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
