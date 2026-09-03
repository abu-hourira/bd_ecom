"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Truck,
  MessageCircle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileAccountDashboard({ user }: { user?: any }) {
  const { user: authUser, logout, isStaff } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();
  const currentUser = user || authUser;

  const isBn = locale === "bn";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "E";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="md:hidden space-y-4 pb-4">
      {/* 1. App-Style User Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143520] via-[#1b4329] to-[#0d2315] text-white p-5 shadow-lg border border-amber-500/20">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-950 font-black text-lg flex items-center justify-center shadow-md border-2 border-white/20 shrink-0">
            {getInitials(currentUser?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-300/30">
                {isBn ? "প্রিমিয়াম গ্রাহক" : "Verified Member"}
              </span>
            </div>
            <h2 className="text-base font-bold truncate text-white mt-1">
              {currentUser?.name || (isBn ? "সম্মানিত গ্রাহক" : "Valued Customer")}
            </h2>
            <p className="text-xs text-stone-300 truncate font-mono">
              {currentUser?.phone || currentUser?.email || "ENMAR Organic"}
            </p>
          </div>
        </div>

        {isStaff && (
          <div className="mt-4 pt-3 border-t border-white/15">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold shadow-sm active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>{isBn ? "অ্যাডমিন কন্ট্রোল প্যানেল" : "Admin Dashboard"}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. Quick Action Hub (4 Feature Cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* My Orders */}
        <Link
          href="/account/orders"
          className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-forest/40 shadow-xs flex flex-col justify-between active:scale-98 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-forest flex items-center justify-center mb-2">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block">
              {isBn ? "আমার অর্ডারসমূহ" : "My Orders"}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {isBn ? "সকল অর্ডারের হিস্ট্রি" : "View order history"}
            </span>
          </div>
        </Link>

        {/* Live Order Tracking */}
        <Link
          href="/track"
          className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-forest/40 shadow-xs flex flex-col justify-between active:scale-98 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block">
              {isBn ? "লাইভ ট্র্যাকিং" : "Live Tracking"}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {isBn ? "রাইডারের লোকেশন দেখুন" : "Track package stage"}
            </span>
          </div>
        </Link>

        {/* Saved Addresses */}
        <Link
          href="/account/addresses"
          className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-forest/40 shadow-xs flex flex-col justify-between active:scale-98 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-2">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block">
              {isBn ? "সংরক্ষিত ঠিকানা" : "Saved Addresses"}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {isBn ? "ডেলিভারি ঠিকানা ম্যানেজ" : "Manage delivery spots"}
            </span>
          </div>
        </Link>

        {/* WhatsApp Direct Help */}
        <a
          href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20ENMAR%20থেকে%20সাহায্য%20প্রয়োজন।"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-400 shadow-xs flex flex-col justify-between active:scale-98 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block">
              {isBn ? "হোয়াটসঅ্যাপ হেল্প" : "WhatsApp Help"}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {isBn ? "২৪/৭ সরাসরি সাপোর্ট" : "1-Tap direct chat"}
            </span>
          </div>
        </a>
      </div>

      {/* 3. Account Settings & Logout Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-2 divide-y divide-stone-100 shadow-xs">
        <Link
          href="/account/wishlist"
          className="flex items-center justify-between p-3 text-xs font-semibold text-stone-800 hover:bg-stone-50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{isBn ? "আমার পছন্দের তালিকা (উইশলিস্ট)" : "My Wishlist"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </Link>

        <Link
          href="/account/profile#security"
          className="flex items-center justify-between p-3 text-xs font-semibold text-stone-800 hover:bg-stone-50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>{isBn ? "পাসওয়ার্ড ও নিরাপত্তা সেটিংস" : "Security & Password"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>{isBn ? "অ্যাকাউন্ট থেকে লগআউট" : "Sign Out"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300" />
        </button>
      </div>
    </div>
  );
}
