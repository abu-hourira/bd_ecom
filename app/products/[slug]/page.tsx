"use client";
// app/products/[slug]/page.tsx - Ultra-Polished Mobile & Desktop Product Detail Page

import { useEffect, useState, use } from "react";
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
import { formatTaka, getProductImages, getSafeImageUrl } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { t, locale } = useLanguage();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/storefront/products/${resolvedParams.slug}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [resolvedParams.slug]);

  if (loading) {
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

  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between overflow-x-hidden">
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 flex-1 w-full pb-28 md:pb-16">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 font-medium overflow-x-auto whitespace-nowrap">
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
                className="hover:text-forest transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-stone-800 font-bold truncate max-w-[150px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* 2. Main Product Section (Gallery + Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-start">
          {/* Left: Product Images Gallery */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-2xl sm:rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs flex items-center justify-center">
              <Image
                src={getSafeImageUrl(activeImage)}
                alt={product.name}
                fill
                priority
                className="object-contain p-3 sm:p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.isOrganic && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#143520] text-amber-300 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    <Leaf className="w-3 h-3 text-amber-400" />
                    <span>{locale === "bn" ? "১০০% অর্গানিক সার্টিফাইড" : "100% Organic"}</span>
                  </span>
                )}
              </div>

              {hasDiscount && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-black tracking-tight shadow-sm">
                    -{discountPercent}% {locale === "bn" ? "ছাড়" : "OFF"}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-forest shadow-sm scale-105"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={getSafeImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover p-1"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & CTA */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5">
              {product.category && (
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-forest bg-forest-soft px-2.5 py-0.5 rounded-full inline-block">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-xl sm:text-3xl font-display font-bold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {product.unit && (
                <span className="text-xs sm:text-sm text-stone-500 font-medium block">
                  {locale === "bn" ? "পরিমাণ:" : "Pack Size:"} <strong className="text-stone-800">{product.unit}</strong>
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-forest">
                  {formatTaka(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm sm:text-base font-mono text-stone-400 line-through">
                    {formatTaka(Number(product.price))}
                  </span>
                )}
              </div>

              {/* Stock Badge */}
              {isOutOfStock ? (
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                  {locale === "bn" ? "স্টক শেষ" : "Out of Stock"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "স্টকে আছে" : "In Stock"}</span>
                </span>
              )}
            </div>

            {/* Desktop Quantity & Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-forest hover:bg-forest-deep text-white"
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

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3 px-6 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-stone-950" />
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
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong className="block text-stone-800">{locale === "bn" ? "১০০% খাঁটি পণ্য" : "100% Genuine"}</strong>
                  <span className="text-stone-500">{locale === "bn" ? "ল্যাব টেস্টেড" : "Quality Tested"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
                <h3 className="font-display font-bold text-xs sm:text-sm text-stone-900">
                  {locale === "bn" ? "পণ্যের বিবরণ:" : "Product Description:"}
                </h3>
                <div className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
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

      {/* 4. Sticky Mobile Bottom Action Bar (Fixed on phones) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2">
        {/* Left: Quantity & Price */}
        <div className="flex items-center gap-1.5 border border-stone-200 rounded-xl bg-stone-50 p-1 shrink-0">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-6 h-6 flex items-center justify-center text-stone-600 active:bg-stone-200 rounded"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-5 text-center font-mono font-bold text-xs">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-6 h-6 flex items-center justify-center text-stone-600 active:bg-stone-200 rounded"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 truncate ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-forest text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{locale === "bn" ? "যোগ হয়েছে" : "Added"}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>{locale === "bn" ? "কার্ট" : "Cart"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 py-2.5 px-2 rounded-xl font-bold text-xs bg-amber-500 text-stone-950 flex items-center justify-center gap-1 active:scale-95 truncate"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{locale === "bn" ? "অর্ডার করুন" : "Buy Now"}</span>
          </button>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}
