import Image from "next/image";
"use client";
// components/storefront/Header.tsx

import Link from "next/link";
import { useState, useEffect } from "react";
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
  Truck,
  Leaf,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "./LanguageToggle";

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
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    brandName: "ENMAR",
    brandTagline: "Pure Organic Food",
    contactPhone: "+880 1614 113082",
    siteLogo: "",
  });

  useEffect(() => {
    fetch("/api/storefront/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch(() => {});

    try {
      const savedUser = localStorage.getItem("enmar_customer");
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

  const navLinks = [
    { label: t("nav.allProducts"), href: "/products" },
    { label: t("nav.honey"), href: "/products?category=honey-sweeteners" },
    { label: t("nav.oilsGhee"), href: "/products?category=oils-ghee" },
    { label: t("nav.spices"), href: "/products?category=organic-spices" },
    { label: t("nav.combos"), href: "/products?category=combo-bundle-deals" },
    { label: t("nav.login"), href: "/wellness" },
    { label: t("nav.trackOrder"), href: "/track" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs overflow-x-hidden w-full">
      {/* 1. Top Announcement Bar */}
      <div className="bg-forest-deep text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="truncate">{t("topbar.announcement")}</span>
          </div>

          <div className="flex items-center gap-4 text-white/80 text-[11px] shrink-0">
            {/* Conditional Staff Link in Top Bar */}
            {isStaff && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold tracking-wide hover:bg-amber-300 transition-all shadow-xs"
                title="Go to Admin Panel"
              >
                <LayoutDashboard className="w-3 h-3 text-stone-950" />
                <span>{locale === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Panel"}</span>
              </Link>
            )}

            <a
              href="tel:+8801614113082"
              className="hidden md:flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span>{t("topbar.phone")}</span>
            </a>
            <span className="hidden md:inline text-white/30">•</span>
            <div className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>100% BSTI & Organic Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
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
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform bg-forest-soft border border-forest/20">
                <Image
                  src={getSafeImageUrl(siteSettings.siteLogo)}
                  alt={siteSettings.brandName || "ENMAR"}
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-accent shadow-xs group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-forest leading-none">
                {siteSettings.brandName || "ENMAR"}
              </span>
              <span className="text-[9px] tracking-widest uppercase text-stone-600 font-mono -mt-0.5 font-bold">
                {t("nav.brandSub")}
              </span>
            </div>
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder={t("search.placeholder")}
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

        {/* Action Buttons: Language, Account, Wishlist, Staff Admin & Cart */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <LanguageToggle />

          {/* Conditional Staff Link Button in Header */}
          {isStaff && (
            <Link
              href="/admin"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-amber-950 flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
              title={locale === "bn" ? "অ্যাডমিন প্যানেল খুলুন" : "Open Admin Panel"}
            >
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span className="hidden sm:inline">
                {locale === "bn" ? "অ্যাডমিন" : "Admin"}
              </span>
            </Link>
          )}

          {/* Account Icon */}
          <Link
            href={customer ? "/account/profile" : "/auth/login"}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 hover:border-forest/40 bg-stone-50 text-stone-800 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
            title={customer ? `Hi, ${customer.name}` : "Customer Login"}
          >
            <User className="w-4 h-4 text-forest" />
            <span className="hidden sm:inline">
              {customer ? customer.name.split(" ")[0] : t("nav.login")}
            </span>
          </Link>

          {/* Wishlist Link (Desktop) */}
          <Link
            href={customer ? "/account/wishlist" : "/auth/login"}
            className="hidden sm:flex p-2 rounded-xl border border-stone-200 hover:border-forest/40 bg-stone-50 text-stone-800 items-center justify-center transition-all cursor-pointer"
            title="My Wishlist"
          >
            <Heart className="w-4 h-4 text-rose-500" />
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-forest hover:bg-forest-deep text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">{t("nav.cart")}</span>
            <span className="w-5 h-5 rounded-full bg-accent text-forest-deep text-[11px] font-extrabold flex items-center justify-center ml-0.5">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Desktop Sub-Navigation Menu */}
      <nav className="hidden lg:block border-t border-stone-200/60 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-8 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-stone-600 hover:text-forest transition-colors py-1 relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-full py-2.5 pl-4 pr-10 text-xs text-stone-800"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-forest text-white"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <nav className="flex flex-col space-y-1 pt-2 border-t border-stone-200">
            {isStaff && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-amber-950 py-2.5 px-3 rounded-xl bg-amber-100 border border-amber-300 flex items-center gap-2 mb-1 shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-800" />
                <span>{locale === "bn" ? "অ্যাডমিন প্যানেল ড্যাশবোর্ড" : "Admin Panel Dashboard"}</span>
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-stone-700 py-2.5 px-3 rounded-lg hover:bg-stone-100"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href={customer ? "/account/profile" : "/auth/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-forest py-2.5 px-3 rounded-lg bg-emerald-50 flex items-center gap-2 mt-2"
            >
              <User className="w-4 h-4" />
              <span>
                {customer
                  ? `${customer.name} (${t("nav.login")})`
                  : locale === "bn"
                  ? "কাস্টমার লগইন / রেজিস্টার"
                  : "Customer Login / Register"}
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
