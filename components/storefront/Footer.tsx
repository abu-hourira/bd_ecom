"use client";
// components/storefront/Footer.tsx

import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function StorefrontFooter() {
  const { t, locale } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Value Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t("footer.badge1Title")}</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{t("footer.badge1Desc")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-accent flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t("footer.badge2Title")}</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{t("footer.badge2Desc")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-accent flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t("footer.badge3Title")}</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{t("footer.badge3Desc")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-accent flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t("footer.badge4Title")}</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{t("footer.badge4Desc")}</p>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-accent shadow-xs">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                  ENMAR
                </span>
                <span className="text-[9px] tracking-widest uppercase text-accent font-mono">
                  {t("nav.brandSub")}
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              {t("footer.brandStory")}
            </p>

            <div className="space-y-1.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>House 14, Road 7, Sector 3, Uttara, Dhaka-1230</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href="tel:+8801614113082" className="hover:text-white transition-colors">
                  +880 1614 113082
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href="mailto:support@enmar.bd" className="hover:text-white transition-colors">
                  support@enmar.bd
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("footer.popularCategories")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=honey-sweeteners" className="hover:text-accent transition-colors">
                  {t("nav.honey")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=oils-ghee" className="hover:text-accent transition-colors">
                  {t("nav.oilsGhee")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=organic-spices" className="hover:text-accent transition-colors">
                  {t("nav.spices")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=combo-bundle-deals" className="hover:text-accent transition-colors">
                  {t("nav.combos")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("footer.customerCare")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track" className="hover:text-accent transition-colors">
                  {t("nav.trackOrder")}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-accent transition-colors">
                  {t("footer.history")}
                </Link>
              </li>
              <li>
                <Link href="/wellness" className="hover:text-accent transition-colors">
                  {t("footer.wellness")}
                </Link>
              </li>
              <li>
                <Link href="/returns/new" className="hover:text-accent transition-colors">
                  {t("footer.returnRefund")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("footer.policiesTrust")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-accent transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-accent transition-colors">
                  {t("footer.shippingInfo")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t("footer.copyright")}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>BSTI Certified Organic</span>
            <span>•</span>
            <span>SSLCommerz Secured</span>
            <span>•</span>
            <span>Pathao & Steadfast Courier</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
