// components/account/AccountNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("enmar_customer");
    router.push("/");
  };

  const navItems = [
    {
      label: lang === "bn" ? "প্রোফাইল তথ্য" : "My Profile",
      href: "/account/profile",
      icon: User,
    },
    {
      label: lang === "bn" ? "অর্ডার হিস্ট্রি" : "Order History",
      href: "/account/orders",
      icon: ShoppingBag,
    },
    {
      label: lang === "bn" ? "ডেলিভারি ঠিকানা" : "Saved Addresses",
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: lang === "bn" ? "উইশলিস্ট" : "My Wishlist",
      href: "/account/wishlist",
      icon: Heart,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-paper rounded-3xl border border-line p-5 shadow-card space-y-4 shrink-0">
        <div className="border-b border-line pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">
            {lang === "bn" ? "কাস্টমার পোর্টাল" : "Customer Portal"}
          </span>
          <h3 className="font-bold font-display text-base text-ink">
            {lang === "bn" ? "আমার একাউন্ট" : "Account Overview"}
          </h3>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-forest text-white shadow-xs"
                    : "text-ink-soft hover:bg-bg hover:text-ink"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-line">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === "bn" ? "লগআউট" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Tabs */}
      <div className="md:hidden w-full overflow-x-auto pb-2 flex items-center gap-2 border-b border-line">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-forest text-white"
                  : "bg-paper border border-line text-ink-soft"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
