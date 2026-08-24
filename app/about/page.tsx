"use client";
// app/about/page.tsx

import Link from "next/link";
import { Leaf, ShieldCheck, Heart, Users, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  return (
    <div className="min-h-screen bg-bg text-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
        </Link>

        {/* Hero Section */}
        <div className="space-y-4 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-4 h-4" />
            <span>{isBn ? "আমাদের গল্প ও লক্ষ্য" : "Our Story & Purpose"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink leading-tight">
            {isBn ? "প্রকৃতির খাঁটি স্বাদ আপনার ঘরে পৌঁছে দিতে ENMAR" : "Pure Organic Nutrition Delivered to Your Table"}
          </h1>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            {isBn
              ? "ভেজালমুক্ত খাঁটি খাবারের সন্ধানে আমাদের পথচলা। সুন্দরবনের প্রাকৃতিক চাকভাঙা মধু, কাঠের ঘানিতে ভাঙা খাঁটি সরিষার তেল, দেশি গাভীর গাওয়া ঘি ও বাছাইকৃত মশলা নিয়ে ENMAR গড়ে তুলেছে বিশ্বস্ততার অনন্য এক নাম।"
              : "ENMAR was founded with a single mission: to provide 100% adulteration-free, authentic organic foods across Bangladesh directly from sustainable farmers."}
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-display text-ink text-base">
              {isBn ? "১০০% বিশুদ্ধতার নিশ্চয়তা" : "100% Pure & Untouched"}
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              {isBn ? "কোনো ক্ষতিকর প্রিজারভেটিভ, কেমিক্যাল বা কৃত্রিম ফ্লেভার নেই।" : "Free from synthetic preservatives, adulteration, or artificial flavors."}
            </p>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-display text-ink text-base">
              {isBn ? "ঘরোয়া যত্ন ও ঐতিহ্য" : "Traditional Crafting"}
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              {isBn ? "ঘরোয়া পরিবেশে কাঠের ঘানিতে ভাঙা তেল ও ঐতিহ্যবাহী ঘরোয়া রেসিপি।" : "Cold-pressed wood mill mustard oils and hand-churned authentic bilona ghee."}
            </p>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-display text-ink text-base">
              {isBn ? "গ্রাহক সন্তুষ্টি" : "Direct Farmer Fair Trade"}
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              {isBn ? "সরাসরি কৃষক ও প্রান্তিক মৌয়ালদের কাছ থেকে সংগৃহীত ন্যায্য মূল্যের পণ্য।" : "Empowering local beekeepers, rural dairy farms, and organic farmers."}
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-forest-deep text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-display">{isBn ? "সুস্থ জীবনের জন্য বেছে নিন খাঁটি খাবার" : "Choose Pure Foods for a Healthier Life"}</h3>
            <p className="text-xs text-white/80">{isBn ? "আমাদের সম্পূর্ণ ক্যাটালগ ঘুরে দেখুন এবং সেরা অর্গানিক পণ্য উপভোগ করুন।" : "Explore our certified organic collection today."}</p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-amber-400 text-forest-deep font-bold text-xs shadow-premium transition-all shrink-0 flex items-center gap-2"
          >
            <span>{isBn ? "শপ ব্রাউজ করুন" : "Explore Shop"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
