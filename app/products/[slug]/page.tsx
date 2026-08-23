// app/products/[slug]/page.tsx
"use client";

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
  Loader2,
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
        <div className="py-24 text-center text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-forest mb-2" />
          <span>{t("productDetail.loading")}</span>
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
          <h2 className="text-2xl font-bold font-display text-stone-900">
            {t("productDetail.loading")}
          </h2>
          <p className="text-xs text-stone-600">
            {locale === "bn"
              ? "আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে অনুপলব্ধ অথবা সরানো হয়েছে।"
              : "The product you requested does not exist or has been removed."}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold"
          >
            <span>{t("productDetail.loading")}</span>
          </Link>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  const images = getProductImages(product.images);

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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-forest">
            {t("productDetail.loading")}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-forest">
            {t("productDetail.loading")}
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-forest"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xs">
              <Image
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover"
                unoptimized={true}
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.organicCertified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-forest text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                    <Leaf className="w-3 h-3 text-amber-300" />
                    <span>{t("products.organicBadge")}</span>
                  </span>
                )}
                {hasDiscount && (
                  <span className="inline-block px-3 py-1 rounded-md bg-amber-500 text-stone-950 text-xs font-extrabold uppercase tracking-wider shadow-xs">
                    {discountPercent}% {t("products.save")}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-forest shadow-xs scale-105"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <Image src={img} alt="Thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Information & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              {product.category && (
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-stone-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold text-xs text-stone-900 ml-1">5.0</span>
                  <span className="text-stone-500 text-xs">
                    ({t("productDetail.loading")})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-forest font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? t("product.linkCopied") : t("product.share")}</span>
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold font-display text-forest">
                  {formatTaka(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-stone-400 line-through font-mono">
                    {formatTaka(product.price)}
                  </span>
                )}
                <span className="text-xs text-stone-500 font-mono">
                  / {product.unit || "পিস"}
                </span>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    {t("product.outOfStockWarning")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t("product.readyDispatch")}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity + Add to Cart CTAs */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t("product.quantity")}
                </span>
                <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden p-0.5">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-mono font-bold text-sm text-stone-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dual Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                    added ? "bg-emerald-700" : "bg-forest hover:bg-forest-deep"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("productDetail.loading")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t("product.addToCart")}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span>{t("product.buyNow")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Value Props List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-200">
              <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span className="text-xs font-semibold text-stone-800">{t("footer.badge1Title")}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest shrink-0" />
                <span className="text-xs font-semibold text-stone-800">{t("footer.badge3Title")}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-forest shrink-0" />
                <span className="text-xs font-semibold text-stone-800">{t("footer.badge2Title")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Full Description */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-display text-stone-900 border-b border-stone-200 pb-3">
            {t("product.descriptionTitle")}
          </h3>

          <div className="text-sm text-stone-700 leading-relaxed space-y-3">
            <p>
              {product.description ||
                "আমাদের সকল অর্গানিক খাদ্য সম্পূর্ণ ভেজালমুক্ত, শতভাগ প্রাকৃতিক এবং স্বাস্থ্যকর উপায়ে সংগৃহীত।"}
            </p>

            {product.shortDescription && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs font-medium">
                <strong>মূল বৈশিষ্ট্য:</strong> {product.shortDescription}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-xl font-bold font-display text-stone-900">
                {t("product.relatedTitle")}
              </h3>

              <Link
                href="/products"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t("productDetail.loading")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
