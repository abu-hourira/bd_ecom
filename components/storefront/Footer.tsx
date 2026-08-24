"use client";
// components/storefront/Footer.tsx - 100% Dynamic Database-Driven Footer

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getSafeImageUrl } from "@/lib/utils";

export default function StorefrontFooter() {
  const { t, locale } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({
    brandName: "ENMAR",
    brandTagline: "100% Pure Organic Food & Pantry Essentials",
    contactPhone: "+880 1614 113082",
    contactEmail: "support@enmar.shop",
    contactAddress: "House 14, Road 7, Sector 3, Uttara, Dhaka-1230",
    whatsappNumber: "8801614113082",
    siteLogo: "",
  });

  useEffect(() => {
    fetch("/api/storefront/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* 1. Value Badges Grid */}
      <div className="border-b border-stone-800 bg-stone-950/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">১০০% অর্গানিক সার্টিফাইড</h4>
            <p className="text-xs text-stone-400">রাসায়নিক ও বিষমুক্ত প্রাকৃতিক উপাদান</p>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">সারা দেশে দ্রুত ডেলিভারি</h4>
            <p className="text-xs text-stone-400">২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</p>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">ক্যাশ অন ডেলিভারি</h4>
            <p className="text-xs text-stone-400">পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা</p>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">সহজ রিটার্ন পলিসি</h4>
            <p className="text-xs text-stone-400">পণ্য নষ্ট হলে তাৎক্ষণিক বদল বা রিফান্ড</p>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              {settings.siteLogo ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs bg-stone-800 border border-stone-700">
                  <Image
                    src={getSafeImageUrl(settings.siteLogo)}
                    alt={settings.brandName || "ENMAR"}
                    fill
                    className="object-contain p-0.5"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400">
                  <Leaf className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="font-display font-bold text-2xl tracking-tight text-white leading-none">
                  {settings.brandName || "ENMAR"}
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-amber-400 font-mono font-bold mt-0.5">
                  {settings.brandTagline || "100% Pure Organic Food"}
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              ইনমার (ENMAR) – বাংলাদেশের বিশ্বস্ত প্রিমিয়াম অর্গানিক ফুড ব্র্যান্ড। সুন্দরবনের কাঁচা মধু, খাঁটি গাওয়া ঘি, ঘানির সরিষার তেল ও বাছাইকৃত পুষ্টিকর খাবার আপনার দোরগোড়ায়।
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${settings.whatsappNumber || "8801614113082"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp সাপোর্ট</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Shop */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              পণ্য ক্যাটাগরি
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=honey-sweeteners" className="hover:text-amber-400 transition-colors">
                  মধু ও প্রাকৃতিক মিষ্টি
                </Link>
              </li>
              <li>
                <Link href="/products?category=oils-ghee" className="hover:text-amber-400 transition-colors">
                  ঘি ও ঘানিভাঙা তেল
                </Link>
              </li>
              <li>
                <Link href="/products?category=dates-dry-fruits" className="hover:text-amber-400 transition-colors">
                  মদিনার আজওয়া ও খেজুর
                </Link>
              </li>
              <li>
                <Link href="/products?category=organic-spices" className="hover:text-amber-400 transition-colors">
                  অর্গানিক মশলা
                </Link>
              </li>
              <li>
                <Link href="/products?category=combo-bundle-deals" className="hover:text-amber-400 transition-colors">
                  ফ্যামিলি কম্বো ও ডিলস
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              কাস্টমার কেয়ার
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track" className="hover:text-amber-400 transition-colors">
                  অর্ডার ট্র্যাকিং
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-amber-400 transition-colors">
                  ডেলিভারি ও শিপিং পলিসি
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  রিটার্ন ও রিফান্ড পলিসি
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  গোপনীয়তা নীতি (Privacy)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  যোগাযোগ ও অভিযোগ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              যোগাযোগের ঠিকানা
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.contactAddress || "ঢাকা, বাংলাদেশ"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white">
                  {settings.contactPhone || "+880 1614 113082"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail || "support@enmar.shop"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} {settings.brandName || "ENMAR"}. সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span>100% BSTI Standard Quality</span>
            <span>•</span>
            <span>SSLCommerz Secured Payment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
