"use client";
// components/storefront/Footer.tsx - Clean 100% Dynamic Footer

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Store,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useStorefront } from "@/context/StorefrontContext";
import { getSafeImageUrl } from "@/lib/utils";

export default function StorefrontFooter() {
  const { locale } = useLanguage();
  const { settings, categories } = useStorefront();

  const brandTitle = settings.brandName || "";

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group min-h-[36px]">
              {settings.siteLogo ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs bg-stone-800 border border-stone-700 shrink-0">
                  <Image
                    src={getSafeImageUrl(settings.siteLogo)}
                    alt={brandTitle || "Logo"}
                    fill
                    className="object-contain p-0.5"
                    sizes="40px"
                  />
                </div>
              ) : null}
              <div>
                {brandTitle ? (
                  <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                    {brandTitle}
                  </span>
                ) : (
                  <div className="w-28 h-5 bg-stone-800 rounded-md animate-pulse" />
                )}
                {settings.brandTagline && (
                  <span className="block text-[10px] tracking-wider uppercase text-amber-400 font-mono font-semibold mt-0.5">
                    {settings.brandTagline}
                  </span>
                )}
              </div>
            </Link>

            {settings.whatsappNumber && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            )}
          </div>

          {/* Column 2: Quick Shop Categories (Real DB Categories) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">
              {locale === "bn" ? "পণ্য ক্যাটাগরি" : "Categories"}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  {locale === "bn" ? "সকল পণ্য" : "All Products"}
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">
              {locale === "bn" ? "কাস্টমার কেয়ার" : "Customer Care"}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  {locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Order Tracking"}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  {locale === "bn" ? "ডেলিভারি পলিসি" : "Shipping Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {locale === "bn" ? "রিটার্ন ও রিফান্ড" : "Return & Refund"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info (Only if entered in settings) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">
              {locale === "bn" ? "যোগাযোগ" : "Contact"}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {settings.contactAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{settings.contactAddress}</span>
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a href={`tel:${settings.contactPhone}`} className="hover:text-white">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings.contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
          <div>
            {brandTitle ? `© ${new Date().getFullYear()} ${brandTitle}. All rights reserved.` : `© ${new Date().getFullYear()}. All rights reserved.`}
          </div>
        </div>
      </div>
    </footer>
  );
}
