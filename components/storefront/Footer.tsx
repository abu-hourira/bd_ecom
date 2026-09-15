"use client";
// components/storefront/Footer.tsx - Clean 100% Dynamic Footer with Payment & Trust Badges

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useStorefront } from "@/context/StorefrontContext";
import { getSafeImageUrl } from "@/lib/utils";

export default function StorefrontFooter() {
  const { locale } = useLanguage();
  const { settings, categories } = useStorefront();
  const isBn = locale === "bn";

  const brandTitle = settings.brandName || "ENMAR";

  return (
    <footer className="bg-[#0D1C12] text-stone-300 border-t border-forest-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800/80">
          {/* Column 1: Brand Info & WhatsApp */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group min-h-[40px]">
              {settings.siteLogo ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0 ring-1 ring-white/20">
                  <Image
                    src={getSafeImageUrl(settings.siteLogo)}
                    alt={brandTitle}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : null}
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-white leading-none block">
                  {brandTitle}
                </span>
                <span className="block text-xs font-medium text-amber-300/90 tracking-wide mt-1">
                  {settings.brandTagline || "100% Pure Organic Food"}
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed">
              {isBn
                ? "খাঁটি ও প্রাকৃতিক খাদ্যপণ্যের বিশ্বস্ত প্রতিষ্ঠান। আমাদের লক্ষ্য স্বাস্থ্যকর ও নির্ভেজাল খাদ্যাভ্যাস গড়ে তোলা।"
                : "Your trusted destination for farm-fresh, chemical-free organic foods and pantry staples."}
            </p>

            {settings.whatsappNumber && (
              <div>
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isBn ? "হোয়াটসঅ্যাপে যোগাযোগ" : "WhatsApp Support"}</span>
                </a>
              </div>
            )}
          </div>

          {/* Column 2: Quick Shop Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider text-amber-400">
              {isBn ? "পণ্য ক্যাটাগরি" : "Categories"}
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  {isBn ? "সকল অর্গানিক পণ্য" : "All Organic Products"}
                </Link>
              </li>
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider text-amber-400">
              {isBn ? "গ্রাহক সেবা ও নীতি" : "Customer Care"}
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/track" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? "লাইভ অর্ডার ট্র্যাকিং" : "Live Order Tracking"}</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  {isBn ? "ডেলিভারি তথ্য ও চার্জ" : "Shipping Information"}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? "রিটার্ন ও রিফান্ড নীতি" : "Returns & Refund Policy"}</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {isBn ? "শর্তাবলী (Terms & Conditions)" : "Terms & Conditions"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider text-amber-400">
              {isBn ? "যোগাযোগ ও ঠিকানা" : "Contact & Address"}
            </h3>
            <div className="space-y-2.5 text-xs text-stone-400">
              {settings.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`tel:${settings.contactPhone}`} className="hover:text-white">
                    {settings.contactPhone}
                  </a>
                </div>
              )}
              {settings.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.contactAddress || "ঢাকা, বাংলাদেশ"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payment Logos & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {brandTitle}. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-400 font-semibold">
              {isBn ? "নিরাপদ পেমেন্ট পার্টনার:" : "Payment Methods:"}
            </span>
            <div className="flex items-center gap-2 bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800">
              <span className="text-[11px] font-bold text-pink-400">bKash</span>
              <span className="text-stone-600">|</span>
              <span className="text-[11px] font-bold text-amber-400">Nagad</span>
              <span className="text-stone-600">|</span>
              <span className="text-[11px] font-bold text-emerald-400">COD</span>
              <span className="text-stone-600">|</span>
              <span className="text-[11px] font-bold text-sky-400">Cards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
