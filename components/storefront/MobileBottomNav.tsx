"use client";
// components/storefront/MobileBottomNav.tsx - Ultra-Polished Sticky Mobile Navigation

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Grid, Truck, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { locale } = useLanguage();

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");
  const isTrack = pathname.startsWith("/track");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/auth");

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isHome ? "text-forest font-bold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <Home className={`w-4 h-4 ${isHome ? "text-forest stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 leading-none">{locale === "bn" ? "হোম" : "Home"}</span>
        </Link>

        {/* 2. Products / Shop */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isProducts ? "text-forest font-bold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <Grid className={`w-4 h-4 ${isProducts ? "text-forest stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 leading-none">{locale === "bn" ? "দোকান" : "Shop"}</span>
        </Link>

        {/* 3. Floating Cart Trigger (Center Hero) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-stone-700 cursor-pointer active:scale-95"
        >
          <div className="relative p-1.5 rounded-full bg-forest text-amber-400 shadow-sm">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-forest leading-none">
            {locale === "bn" ? "কার্ট" : "Cart"}
          </span>
        </button>

        {/* 4. Track Order */}
        <Link
          href="/track"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isTrack ? "text-forest font-bold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <Truck className={`w-4 h-4 ${isTrack ? "text-forest stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 leading-none">{locale === "bn" ? "ট্র্যাকিং" : "Track"}</span>
        </Link>

        {/* 5. Account */}
        <Link
          href="/account/profile"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isAccount ? "text-forest font-bold scale-105" : "text-stone-500 hover:text-stone-900 font-medium"
          }`}
        >
          <User className={`w-4 h-4 ${isAccount ? "text-forest stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 leading-none">{locale === "bn" ? "প্রোফাইল" : "Account"}</span>
        </Link>
      </div>
    </div>
  );
}
