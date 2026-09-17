"use client";
// components/storefront/MobileBottomNav.tsx - Ultra-Polished Sticky Mobile Navigation

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Grid, Truck, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { locale } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isBn = locale === "bn";

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");
  const isTrack = pathname.startsWith("/track");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/auth");

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-2.5">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            isHome ? "text-forest font-extrabold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${isHome ? "text-forest stroke-[2.5]" : ""}`} />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-forest rounded-full shadow-xs" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">{isBn ? "হোম" : "Home"}</span>
        </Link>

        {/* 2. Products / Shop */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            isProducts ? "text-forest font-extrabold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <div className="relative">
            <Grid className={`w-5 h-5 ${isProducts ? "text-forest stroke-[2.5]" : ""}`} />
            {isProducts && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-forest rounded-full shadow-xs" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">{isBn ? "ক্যাটালগ" : "Shop"}</span>
        </Link>

        {/* 3. Floating Cart Trigger (Center Hero) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center -mt-5 py-0.5 px-3 rounded-2xl text-stone-700 cursor-pointer active:scale-90 transition-transform"
        >
          <span className="relative block p-3.5 rounded-full bg-gradient-to-tr from-[#1F0E03] via-[#843A02] to-[#A34E08] text-amber-300 shadow-xl shadow-forest/35 ring-4 ring-white">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </span>
          <span className="text-[10px] mt-1 font-bold text-forest leading-none">
            {isBn ? "কার্ট" : "Cart"}
          </span>
        </button>

        {/* 4. Track Order */}
        <Link
          href="/track"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            isTrack ? "text-forest font-extrabold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <div className="relative">
            <Truck className={`w-5 h-5 ${isTrack ? "text-forest stroke-[2.5]" : ""}`} />
            {isTrack && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-forest rounded-full shadow-xs" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">{isBn ? "ট্র্যাক" : "Track"}</span>
        </Link>

        {/* 5. Account */}
        <Link
          href={isAuthenticated ? "/account/profile" : "/auth/login"}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            isAccount ? "text-forest font-extrabold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${isAccount ? "text-forest stroke-[2.5]" : ""}`} />
            {isAccount && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-forest rounded-full shadow-xs" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">
            {isAuthenticated ? (isBn ? "প্রোফাইল" : "Account") : (isBn ? "লগইন" : "Login")}
          </span>
        </Link>
      </div>
    </div>
  );
}
