"use client";
// components/storefront/Header.tsx - 100% Dynamic Clean Header

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
  Heart,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [customer, setCustomer] = useState<LoggedInUser | null>(null);
  const [navCategories, setNavCategories] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    brandName: "",
    brandTagline: "",
    contactPhone: "",
    siteLogo: "",
  });

  useEffect(() => {
    fetch("/api/storefront/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setNavCategories(data.categories);
        }
      })
      .catch(() => {});

    fetch("/api/storefront/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
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
    }
  };

  const isStaff = Boolean(
    customer?.role &&
      ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(customer.role)
  );

  const brandTitle = siteSettings.brandName || "STORE";
  const brandSub = siteSettings.brandTagline || "";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs overflow-x-hidden w-full">
      {/* 1. Top Announcement Bar (Only if phone or custom message is configured) */}
      {(siteSettings.contactPhone || isStaff) && (
        <div className="bg-[#143520] text-white text-xs py-1.5 px-4">
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

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 lg:hidden border border-stone-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            {siteSettings.siteLogo ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform bg-stone-50 border border-stone-200">
                <Image
                  src={getSafeImageUrl(siteSettings.siteLogo)}
                  alt={brandTitle}
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-forest leading-none">
                {brandTitle}
              </span>
              {brandSub && (
                <span className="text-[9px] tracking-wider uppercase text-stone-500 font-mono font-semibold mt-0.5">
                  {brandSub}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
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

        {/* Action Buttons: Language, Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <LanguageToggle />

          {isStaff && (
            <Link
              href="/admin"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-amber-950 flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span className="hidden sm:inline">
                {locale === "bn" ? "অ্যাডমিন" : "Admin"}
              </span>
            </Link>
          )}

          {/* Account */}
          <Link
            href={customer ? "/account/profile" : "/auth/login"}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 hover:border-forest/40 bg-stone-50 text-stone-800 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
          >
            <User className="w-4 h-4 text-forest" />
            <span className="hidden sm:inline">
              {customer ? customer.name.split(" ")[0] : (locale === "bn" ? "লগইন" : "Login")}
            </span>
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-forest hover:bg-forest-deep text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{locale === "bn" ? "কার্ট" : "Cart"}</span>
            <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-extrabold flex items-center justify-center ml-0.5">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Desktop Sub-Navigation Menu (Only Real Database Categories) */}
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
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={locale === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-full py-2 pl-4 pr-10 text-xs text-stone-800 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-forest text-white"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <nav className="flex flex-col space-y-2 text-xs font-medium text-stone-700">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-stone-100"
            >
              {locale === "bn" ? "সকল পণ্য" : "All Products"}
            </Link>
            {navCategories.map((c: any) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 border-b border-stone-100"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5"
            >
              {locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Track Order"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
