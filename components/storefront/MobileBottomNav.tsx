"use client";
// components/storefront/MobileBottomNav.tsx

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

  // Hide on admin routes or rider routes
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/delivery")) {
    return null;
  }

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");
  const isTrack = pathname.startsWith("/track");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/auth");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-xl border-t border-stone-800 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            isHome
              ? "text-amber-400 font-bold scale-105"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">
            {t("nav.home") || (locale === "bn" ? "হোম" : "Home")}
          </span>
        </Link>

        {/* 2. Products / Categories */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            isProducts
              ? "text-amber-400 font-bold scale-105"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          <div className="relative">
            <LayoutGrid className="w-5 h-5" />
            {isProducts && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">
            {t("nav.allProducts") || (locale === "bn" ? "পণ্যসমূহ" : "Shop")}
          </span>
        </Link>

        {/* 3. Cart Trigger (Center Floating Action) */}
        <button
          onClick={() => setIsCartOpen(true)}
          type="button"
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all -translate-y-2.5 border-2 border-stone-900"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 min-w-5 h-5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-stone-900 animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5">
            {t("nav.cart") || (locale === "bn" ? "কার্ট" : "Cart")}
          </span>
        </button>

        {/* 4. Track Order */}
        <Link
          href="/track"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            isTrack
              ? "text-amber-400 font-bold scale-105"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          <div className="relative">
            <Truck className="w-5 h-5" />
            {isTrack && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">
            {t("nav.trackOrder") || (locale === "bn" ? "ট্র্যাকিং" : "Track")}
          </span>
        </Link>

        {/* 5. Account */}
        <Link
          href="/account/profile"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            isAccount
              ? "text-amber-400 font-bold scale-105"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {isAccount && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">
            {t("nav.account") || (locale === "bn" ? "প্রোফাইল" : "Profile")}
          </span>
        </Link>
      </div>
    </nav>
  );
}
