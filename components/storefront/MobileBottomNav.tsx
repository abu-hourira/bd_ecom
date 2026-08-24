"use client";
// components/storefront/MobileBottomNav.tsx - Rock-Solid Sticky Mobile Navigation

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { t, locale } = useLanguage();

  // Hide on admin or rider portals
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/delivery")) {
    return null;
  }

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");
  const isTrack = pathname.startsWith("/track");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/auth");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
      <nav
        aria-label="Mobile Navigation"
        className="w-full bg-[#143520] text-white border-t border-emerald-800/60 shadow-[0_-4px_25px_rgba(0,0,0,0.35)] pb-[env(safe-area-inset-bottom,4px)]"
      >
        <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
              isHome ? "text-amber-400 font-bold" : "text-stone-300 hover:text-white"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {locale === "bn" ? "হোম" : "Home"}
            </span>
          </Link>

          {/* 2. Products */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
              isProducts ? "text-amber-400 font-bold" : "text-stone-300 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {locale === "bn" ? "পণ্যসমূহ" : "Shop"}
            </span>
          </Link>

          {/* 3. Center Floating Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            type="button"
            className="relative flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/30 active:scale-90 transition-all -translate-y-3 border-2 border-[#143520] cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#143520] animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] tracking-tight leading-none mt-0.5">
              {locale === "bn" ? "কার্ট" : "Cart"}
            </span>
          </button>

          {/* 4. Track Order */}
          <Link
            href="/track"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
              isTrack ? "text-amber-400 font-bold" : "text-stone-300 hover:text-white"
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {locale === "bn" ? "ট্র্যাকিং" : "Track"}
            </span>
          </Link>

          {/* 5. Account */}
          <Link
            href="/account/profile"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
              isAccount ? "text-amber-400 font-bold" : "text-stone-300 hover:text-white"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {locale === "bn" ? "প্রোফাইল" : "Profile"}
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
