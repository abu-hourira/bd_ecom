"use client";
// components/storefront/ProductDetailClient.tsx - Instant Zero-Latency Product Detail View

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Minus,
  Star,
  Leaf,
  ShieldCheck,
  Truck,
  ArrowRight,
  Share2,
  Check,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Zap,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { formatTaka, getProductImages, getSafeImageUrl, formatProductUnit } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetailClient({
  initialProduct,
  initialRelated = [],
  slug,
}: {
  initialProduct: any;
  initialRelated?: any[];
  slug: string;
}) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { t, locale } = useLanguage();

  const [product, setProduct] = useState<any>(initialProduct);
  const [related, setRelated] = useState<any[]>(initialRelated);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Background SWR sync for real-time stock/price accuracy
    fetch(`/api/storefront/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          if (data.related) setRelated(data.related);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!product && loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
        <StorefrontHeader />
        <div className="py-24 text-center text-stone-500 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-200/80 animate-pulse mx-auto" />
          <p className="text-xs font-semibold">{locale === "bn" ? "পণ্য লোড হচ্ছে..." : "Loading product details..."}</p>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
        <StorefrontHeader />
        <div className="max-w-xl mx-auto py-24 text-center px-4 space-y-4">
          <h2 className="text-xl font-bold font-display text-stone-900">
            {locale === "bn" ? "পণ্যটি পাওয়া যায়নি" : "Product Not Found"}
          </h2>
          <p className="text-xs text-stone-600">
            {locale === "bn"
              ? "আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে অনুপলব্ধ অথবা সরানো হয়েছে।"
              : "The product you requested does not exist or has been removed."}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-deep transition-all shadow-xs"
          >
            <span>{locale === "bn" ? "সবগুলো পণ্য দেখুন" : "View All Products"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  const images = getProductImages(product.images);
  const activeImage = images[activeImageIndex] || images[0];

  const effectivePrice = Number(product.discountPrice || product.price);
  const hasDiscount =
    product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.price) - Number(product.discountPrice)) /
          Number(product.price)) *
          100
      )
    : 0;

  const isOutOfStock = Number(product.stockQuantity) <= 0;
  const isLowStock =
    Number(product.stockQuantity) > 0 && Number(product.stockQuantity) <= 5;
  const formattedUnit = formatProductUnit(product.unitQuantity, product.unit);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsCartOpen(true);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription || `${product.name} - ENMAR Organic Food`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-8 sm:space-y-12 w-full">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 overflow-x-auto pb-1">
          <Link href="/" className="hover:text-forest transition-colors">
            {locale === "bn" ? "হোম" : "Home"}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-forest transition-colors">
            {locale === "bn" ? "দোকান" : "Shop"}
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-forest transition-colors font-medium text-stone-700"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-stone-900 font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* 2. Main Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-xs">
              <Image
                src={getSafeImageUrl(activeImage)}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 sm:p-6 transition-all duration-300 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.organicCertified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest text-white text-[11px] font-bold shadow-sm">
                    <Leaf className="w-3 h-3 text-amber-300" />
                    <span>{locale === "bn" ? "১০০% অর্গানিক" : "100% Organic"}</span>
                  </span>
                )}
                {hasDiscount && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold shadow-sm">
                    {discountPercent}% {locale === "bn" ? "ছাড়" : "OFF"}
                  </span>
                )}
              </div>

              {/* Share Floating Button */}
              <button
                onClick={handleShare}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md border border-stone-200 transition-all cursor-pointer active:scale-90"
                title={copied ? "Link Copied!" : "Share Product"}
                aria-label="Share product"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-forest shadow-sm scale-105"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={getSafeImageUrl(img)}
                      alt={`${product.name} - thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-1.5"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Info Section (7 cols) */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {/* Category & Badges */}
            <div className="space-y-1.5">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-xs font-bold uppercase tracking-wider text-forest hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-xl sm:text-3xl font-bold font-display text-stone-900 leading-tight">
                {product.name}
              </h1>
              {formattedUnit && (
                <span className="inline-block text-xs font-semibold text-stone-500">
                  {locale === "bn" ? "প্যাক সাইজ:" : "Pack Size:"} {formattedUnit}
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between shadow-2xs">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-forest">
                    {formatTaka(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm sm:text-base font-mono text-stone-400 line-through">
                      {formatTaka(Number(product.price))}
                    </span>
                  )}
                  {formattedUnit && (
                    <span className="text-xs font-medium text-stone-500">
                      / {formattedUnit}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status Badge */}
              <div>
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                    {locale === "bn" ? "স্টক আউট" : "Out of Stock"}
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                    {locale === "bn" ? `মাত্র ${product.stockQuantity} টি বাকি!` : `Only ${product.stockQuantity} left!`}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{locale === "bn" ? "স্টকে আছে" : "In Stock"}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Special Delivery Discount Offer Banner */}
            {(() => {
              let tiers: any[] = [];
              if (Array.isArray(product.deliveryDiscountTiers)) {
                tiers = product.deliveryDiscountTiers;
              } else if (typeof product.deliveryDiscountTiers === "string") {
                try {
                  tiers = JSON.parse(product.deliveryDiscountTiers);
                } catch (e) {}
              }
              if (tiers.length === 0 && Number(product.deliveryDiscountMinQty) > 0 && Number(product.deliveryDiscountAmount) > 0) {
                tiers.push({ minQty: product.deliveryDiscountMinQty, discountAmount: product.deliveryDiscountAmount });
              }

              if (tiers.length === 0) return null;

              return (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-lg bg-amber-200/60 flex items-center justify-center shrink-0 text-amber-900">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {locale === "bn" ? "🎁 স্পেশাল ডেলিভারি ডিসকাউন্ট অফার" : "🎁 Special Delivery Discount Offers"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {tiers.map((t, idx) => {
                      const minQ = Number(t.minQty) || 1;
                      const discA = Number(t.discountAmount) || 0;
                      const isUnlocked = quantity >= minQ;
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border transition-all text-xs flex items-center justify-between ${
                            isUnlocked
                              ? "bg-amber-100/80 border-amber-400 font-bold text-amber-950 shadow-2xs"
                              : "bg-white/80 border-amber-200/60 text-stone-600"
                          }`}
                        >
                          <div>
                            <span className="block font-semibold">
                              {minQ}+ {locale === "bn" ? "টি কিনলে" : "Units"}
                            </span>
                            <span className="text-[10px] text-amber-800">
                              {isUnlocked ? "✓ অফার আনলকড!" : `আর ${Math.max(0, minQ - quantity)} টি প্রয়োজন`}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-900">
                            - ৳{discA}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10.5px] text-amber-800 leading-tight">
                    {locale === "bn"
                      ? "কার্টে পরিমাণ বাড়ালে ডেলিভারি বিল থেকে স্বয়ংক্রিয়ভাবে সর্বোচ্চ ছাড় প্রযোজ্য হবে।"
                      : "Higher quantity orders automatically unlock larger delivery discounts."}
                  </p>
                </div>
              );
            })()}

            {/* Main Quantity Stepper & Action Buttons (Mobile + Desktop Visible) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
              <div className="flex items-center gap-2">
                {/* Stepper */}
                <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1 shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-lg cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-lg cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Buy Now Button (Inline for instant 1-tap checkout) */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 sm:hidden py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
                  <span>{locale === "bn" ? "অর্ডার করুন" : "Buy Now"}</span>
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-forest hover:bg-forest-deep active:bg-forest-deep text-white"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{locale === "bn" ? "কার্টে যোগ করা হয়েছে" : "Added to Cart"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>{locale === "bn" ? "কার্টে যোগ করুন" : "Add to Cart"}</span>
                  </>
                )}
              </button>

              {/* Desktop Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="hidden sm:flex py-3 px-6 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>{locale === "bn" ? "অর্ডার করুন" : "Buy Now"}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-forest shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong className="block text-stone-800">{locale === "bn" ? "দ্রুত ডেলিভারি" : "Fast Delivery"}</strong>
                  <span className="text-stone-500">{locale === "bn" ? "সারা বাংলাদেশে" : "Across Bangladesh"}</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong className="block text-stone-800">{locale === "bn" ? "১০০% খাঁটি" : "100% Genuine"}</strong>
                  <span className="text-stone-500">{locale === "bn" ? "ল্যাব টেস্টেড" : "Quality Tested"}</span>
                </div>
              </div>
            </div>

            {/* Description & Full Details */}
            {product.description && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200/80 space-y-2.5">
                <h3 className="font-bold text-sm sm:text-base font-display text-stone-900 border-b border-stone-100 pb-2">
                  {locale === "bn" ? "পণ্যের বিবরণ ও বৈশিষ্ট্য" : "Product Details & Health Benefits"}
                </h3>
                <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Related Products Carousel/Grid */}
        {related.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-stone-200">
            <h2 className="text-base sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              <span>{locale === "bn" ? "সম্পর্কিত অন্যান্য পণ্য" : "Related Organic Products"}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {related.map((item: any) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
