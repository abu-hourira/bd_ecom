"use client";
// components/storefront/Header.tsx - Ultra-Sleek Modern Luxury Header

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  User,
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useStorefront } from "@/context/StorefrontContext";
import LanguageToggle from "./LanguageToggle";
import HeaderSearchBar from "./HeaderSearchBar";
import { getSafeImageUrl } from "@/lib/utils";

export default function StorefrontHeader() {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { locale } = useLanguage();
  const { user: customer, isStaff } = useAuth();
  const { settings: siteSettings, categories: navCategories } = useStorefront();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Trigger cart bounce when cartCount changes
  useEffect(() => {
    if (cartCount > 0) {
      setCartAnimate(true);
      const t = setTimeout(() => setCartAnimate(false), 600);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  const brandTitle = siteSettings.brandName || "ENMAR";
  const brandSub = siteSettings.brandTagline || "";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs w-full transition-all">
      {/* 1. Desktop Top Bar */}
      {(siteSettings.contactPhone || isStaff || brandSub) && (
        <div className="hidden sm:block bg-gradient-to-r from-[#092C15] via-[#0F4A24] to-[#092C15] text-white text-xs py-1.5 px-4 border-b border-emerald-900/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium truncate text-[11px] text-white/90">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              {brandSub ? (
                <span suppressHydrationWarning className="truncate">{brandSub}</span>
              ) : (
                <span className="truncate">১০০% বিশুদ্ধ অর্গানিক খাদ্য ও গ্রোসারি সম্ভার</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-white/90 text-[11px] shrink-0">
              {isStaff && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold tracking-wide hover:bg-amber-300 transition-all shadow-xs"
                >
                  <LayoutDashboard className="w-3 h-3 text-stone-950" />
                  <span>{locale === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Panel"}</span>
                </Link>
              )}

              {siteSettings.contactPhone && (
                <a
                  href={`tel:${siteSettings.contactPhone}`}
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{siteSettings.contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Drawer Trigger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-700 hover:text-stone-950 lg:hidden border border-stone-200 cursor-pointer active:scale-95 bg-[#F8F6F2] transition-transform"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group min-h-[36px]">
            {siteSettings.siteLogo ? (
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs shrink-0 ring-1 ring-stone-900/10 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={getSafeImageUrl(siteSettings.siteLogo)}
                  alt={brandTitle || "Logo"}
                  fill
                  className="object-cover"
                  sizes="40px"
                  priority
                />
              </div>
            ) : null}
            <div className="flex flex-col justify-center">
              {brandTitle ? (
                <span suppressHydrationWarning className="font-extrabold text-lg sm:text-xl tracking-tight text-[#163E24] leading-none truncate max-w-[140px] sm:max-w-xs font-display group-hover:text-forest transition-colors">
                  {brandTitle}
                </span>
              ) : (
                <div className="w-24 sm:w-32 h-5 bg-stone-200/70 rounded-md animate-pulse" />
              )}
              {brandSub ? (
                <span suppressHydrationWarning className="hidden sm:block text-[11px] text-stone-500 font-medium mt-0.5 truncate max-w-xs leading-tight">
                  {brandSub}
                </span>
              ) : null}
            </div>
          </Link>
        </div>

        {/* Center: Live Inline Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <HeaderSearchBar />
        </div>

        {/* Right: Actions (Language, Search, Cart, Account) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 rounded-xl text-stone-700 hover:text-stone-900 md:hidden border border-stone-200 bg-[#F8F6F2] cursor-pointer active:scale-95 transition-transform"
            aria-label="Search"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          <LanguageToggle />

          {/* Admin badge (if logged in staff) */}
          {isStaff && (
            <Link
              href="/admin"
              className="px-2 py-1 sm:px-3 sm:py-2 rounded-xl bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">
                {locale === "bn" ? "অ্যাডমিন" : "Admin"}
              </span>
            </Link>
          )}

          {/* Desktop Account Link */}
          <Link
            href={customer ? "/account/profile" : "/auth/login"}
            className="hidden sm:flex p-2 sm:px-3.5 sm:py-2 rounded-xl border border-stone-200 hover:border-forest/40 bg-[#F8F6F2] text-stone-800 items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer hover:bg-white active:scale-95"
          >
            <User className="w-4 h-4 text-forest" />
            <span>
              {customer ? customer.name.split(" ")[0] : (locale === "bn" ? "লগইন" : "Login")}
            </span>
          </Link>

          {/* Header Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`relative flex items-center gap-1.5 bg-gradient-to-r from-[#0F4A24] to-[#1B6334] hover:from-[#0A381A] hover:to-[#0F4A24] text-white px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm hover:shadow-forest-glow cursor-pointer active:scale-95 shrink-0 ${
              cartAnimate ? "scale-105 ring-2 ring-amber-400" : ""
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{locale === "bn" ? "কার্ট" : "Cart"}</span>
            <span className={`min-w-4.5 h-4.5 sm:min-w-5 sm:h-5 px-1 rounded-full bg-amber-400 text-stone-950 text-[10px] sm:text-[11px] font-black flex items-center justify-center transition-transform ${
              cartAnimate ? "scale-125 bg-amber-300" : ""
            }`}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-b border-stone-200 animate-in slide-in-from-top-2 duration-150">
          <HeaderSearchBar isMobileOpen={true} onCloseMobile={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* 3. Desktop Sub-Navigation Menu */}
      <nav className="hidden lg:block border-t border-stone-200/70 bg-[#FAF8F5]/90">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-6 py-2">
          <Link
            href="/products"
            className="text-xs font-bold text-stone-700 hover:text-forest transition-colors py-1 cursor-pointer hover:-translate-y-0.5"
          >
            {locale === "bn" ? "সকল পণ্য" : "All Products"}
          </Link>

          <Link
            href="/subscription"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 transition-all py-1 cursor-pointer flex items-center gap-1 bg-amber-100/70 hover:bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300 shadow-2xs hover:-translate-y-0.5"
          >
            <span>{locale === "bn" ? "📦 সাবস্ক্রিপশন বক্স" : "📦 Subscription Box"}</span>
          </Link>

          <Link
            href="/recipes"
            className="text-xs font-semibold text-stone-600 hover:text-forest transition-all py-1 cursor-pointer flex items-center gap-1 hover:-translate-y-0.5"
          >
            <span>{locale === "bn" ? "🌿 রেসিপি ও ভেষজ" : "🌿 Recipes & Remedies"}</span>
          </Link>

          {navCategories.map((c: any) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="text-xs font-semibold text-stone-600 hover:text-forest transition-all py-1 cursor-pointer hover:-translate-y-0.5"
            >
              {c.name}
            </Link>
          ))}

          <Link
            href="/track"
            className="text-xs font-semibold text-stone-600 hover:text-forest transition-all py-1 cursor-pointer flex items-center gap-1 hover:-translate-y-0.5"
          >
            <span>{locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Track Order"}</span>
          </Link>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2 shadow-lg">
          <nav className="flex flex-col space-y-2 text-xs font-medium text-stone-700">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-stone-100 font-bold text-forest flex items-center justify-between"
            >
              <span>{locale === "bn" ? "সকল পণ্য দেখুন" : "All Products"}</span>
              <ChevronRight className="w-4 h-4 text-forest" />
            </Link>

            <Link
              href="/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-stone-100 font-bold text-amber-800 bg-amber-50/70 px-2.5 rounded-xl flex items-center justify-between"
            >
              <span>{locale === "bn" ? "📦 মাসিক সাবস্ক্রিপশন বক্স" : "📦 Subscription Boxes"}</span>
              <ChevronRight className="w-4 h-4 text-amber-800" />
            </Link>

            <Link
              href="/recipes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-stone-100 font-semibold text-forest flex items-center justify-between"
            >
              <span>{locale === "bn" ? "🌿 স্বাস্থ্যকর রেসিপি ও ভেষজ যত্ন" : "🌿 Recipes & Remedies"}</span>
              <span className="text-stone-400">›</span>
            </Link>

            {navCategories.map((c: any) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-stone-100 flex items-center justify-between"
              >
                <span>{c.name}</span>
                <span className="text-stone-400">›</span>
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 flex items-center justify-between font-semibold text-stone-800"
            >
              <span>{locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Track Order"}</span>
              <span className="text-stone-400">›</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
