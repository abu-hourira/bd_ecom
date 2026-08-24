"use client";
import { getCachedSettings, setCachedSettings, getCachedCategories, setCachedCategories } from "@/lib/storeCache";

// components/storefront/Header.tsx - Ultra-Sleek Mobile & Desktop Storefront Header

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
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { getSafeImageUrl } from "@/lib/utils";

interface LoggedInUser {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

export default function StorefrontHeader() {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { t, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customer, setCustomer] = useState<LoggedInUser | null>(null);
  const [navCategories, setNavCategories] = useState<any[]>(() => getCachedCategories());
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>(() => getCachedSettings());

  useEffect(() => {
    fetch("/api/storefront/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setNavCategories(data.categories);
          setCachedCategories(data.categories);
        }
      })
      .catch(() => {});

    fetch("/api/storefront/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
          setCachedSettings(data.settings);
        }
      })
      .catch(() => {});

    try {
      const savedUser = localStorage.getItem("enmar_user");
      if (savedUser) {
        setCustomer(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setSearchOpenMobile(false);
    }
  };

  const isStaff = Boolean(
    customer?.role &&
      ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(customer.role)
  );

  const brandTitle = siteSettings.brandName || "STORE";
  const brandSub = siteSettings.brandTagline || "";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs w-full">
      {/* 1. Desktop Top Bar (Hidden on Mobile to save valuable screen space) */}
      {(siteSettings.contactPhone || isStaff) && (
        <div className="hidden sm:block bg-[#143520] text-white text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium truncate">
              {brandSub && <span className="truncate text-white/90">{brandSub}</span>}
            </div>

            <div className="flex items-center gap-4 text-white/80 text-[11px] shrink-0">
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
                  className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{siteSettings.contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar (Clean & Compact on Mobile) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Drawer Trigger & Logo/Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-700 hover:text-stone-950 lg:hidden border border-stone-200 cursor-pointer active:scale-95 bg-stone-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            {siteSettings.siteLogo ? (
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs shrink-0 bg-stone-50 border border-stone-200">
                <Image
                  src={getSafeImageUrl(siteSettings.siteLogo)}
                  alt={brandTitle}
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-forest text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-base sm:text-xl tracking-tight text-forest leading-none truncate max-w-[130px] sm:max-w-xs">
                {brandTitle}
              </span>
              {brandSub && (
                <span className="hidden sm:block text-[9px] tracking-wider uppercase text-stone-500 font-mono font-semibold mt-0.5 truncate max-w-xs">
                  {brandSub}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder={locale === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-full py-2 pl-4 pr-10 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-forest focus:ring-1 focus:ring-forest transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-forest text-white hover:bg-forest-deep transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Right: Actions (Language, Search, Admin Badge, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setSearchOpenMobile(!searchOpenMobile)}
            className="p-2 rounded-xl text-stone-700 hover:text-stone-900 md:hidden border border-stone-200 bg-stone-50 cursor-pointer active:scale-95"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <LanguageToggle />

          {/* Admin badge (if logged in staff) */}
          {isStaff && (
            <Link
              href="/admin"
              className="px-2 py-1 sm:px-3 sm:py-2 rounded-xl bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-amber-950 flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
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
            className="hidden sm:flex p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 hover:border-forest/40 bg-stone-50 text-stone-800 items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
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
            className="relative flex items-center gap-1.5 bg-forest hover:bg-forest-deep text-white px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{locale === "bn" ? "কার্ট" : "Cart"}</span>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-stone-950 text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Inline Search Bar (Expands on Search Icon click) */}
      {searchOpenMobile && (
        <div className="md:hidden px-3 pb-2.5 pt-0.5 border-t border-stone-100 animate-in slide-in-from-top-1 duration-150">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              autoFocus
              placeholder={locale === "bn" ? "কী পণ্য খুঁজছেন? লিখুন..." : "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-3.5 pr-9 text-xs text-stone-900 focus:outline-none focus:border-forest"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-forest text-white"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 3. Desktop Sub-Navigation Menu */}
      <nav className="hidden lg:block border-t border-stone-200/60 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-6 py-2">
          <Link
            href="/products"
            className="text-xs font-semibold text-stone-700 hover:text-forest transition-colors py-1 cursor-pointer"
          >
            {locale === "bn" ? "সকল পণ্য" : "All Products"}
          </Link>

          {navCategories.map((c: any) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="text-xs font-semibold text-stone-700 hover:text-forest transition-colors py-1 cursor-pointer"
            >
              {c.name}
            </Link>
          ))}

          <Link
            href="/track"
            className="text-xs font-semibold text-stone-700 hover:text-forest transition-colors py-1 cursor-pointer"
          >
            {locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Track Order"}
          </Link>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2.5 text-xs font-medium text-stone-700">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-stone-100 font-bold text-forest flex items-center justify-between"
            >
              <span>{locale === "bn" ? "সকল পণ্য" : "All Products"}</span>
              <span>→</span>
            </Link>
            {navCategories.map((c: any) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 border-b border-stone-100 flex items-center justify-between"
              >
                <span>{c.name}</span>
                <span className="text-stone-400">›</span>
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 flex items-center justify-between"
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
