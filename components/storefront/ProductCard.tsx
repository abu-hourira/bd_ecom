"use client";
// components/storefront/ProductCard.tsx - Ultra-Premium Luxury Product Card

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap, Leaf, Check, Star, Plus, Eye } from "lucide-react";
import { formatTaka, getProductImages, getSafeImageUrl, formatProductUnit, formatBengaliNumber } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: any;
  onQuickView?: (product: any) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { locale } = useLanguage();
  const [added, setAdded] = useState(false);
  const isBn = locale === "bn";

  const images = getProductImages(product.images);
  const imageSrc = images[0] ? getSafeImageUrl(images[0]) : "/placeholder.png";

  const formattedUnit = formatProductUnit(product.unitQuantity, product.unit);

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

  const productSlug = product.slug || String(product.id);
  const productHref = `/products/${productSlug}`;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    router.push(productHref);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    router.push("/checkout");
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => router.prefetch(productHref)}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 hover:border-forest/50 p-2.5 sm:p-3.5 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative overflow-hidden active:scale-[0.99] cursor-pointer"
    >
      {/* 1. Product Image & Badges (Clean Edge-to-Edge Rounded Frame) */}
      <Link href={productHref} className="block cursor-pointer">
        <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F4EFEB] border border-stone-100 mb-2.5 sm:mb-3 group/frame">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Floating Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.organicCertified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0F4A24]/95 backdrop-blur-md text-emerald-300 text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                <span>{isBn ? "১০০% খাঁটি" : "Organic"}</span>
              </span>
            )}
            {product.featured && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[8px] sm:text-[9px] font-extrabold tracking-tight shadow-xs">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>{isBn ? "সেরা পছন্দ" : "Top Pick"}</span>
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-red-600 text-white text-[9px] sm:text-xs font-black tracking-tight shadow-md">
                -{discountPercent}%
              </span>
            </div>
          )}

          {product.isCombo && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="px-2 py-0.5 rounded-md bg-forest text-white text-[8px] sm:text-[9px] font-bold shadow-xs">
                {isBn ? "কম্বো অফার" : "Combo"}
              </span>
            </div>
          )}

          {/* Quick View Hover Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
              else router.push(productHref);
            }}
            title={isBn ? "এক নজরে দেখুন" : "Quick View"}
            className="absolute bottom-2 right-2 z-10 p-2 rounded-xl bg-white/95 hover:bg-white text-stone-700 hover:text-forest shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hidden sm:flex items-center justify-center hover:scale-110 border border-stone-200/80"
            aria-label="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Category, Title & Unit */}
        <div className="space-y-1">
          {product.category?.name && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/90 block truncate">
              {product.category.name}
            </span>
          )}

          <h3 className="font-display font-bold text-xs sm:text-sm text-stone-900 group-hover:text-forest line-clamp-2 leading-snug min-h-[32px] sm:min-h-[38px] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between gap-1">
            {formattedUnit ? (
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block">
                {formattedUnit}
              </span>
            ) : <span />}

            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
              <span className="text-[8px] sm:text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                {isBn ? `স্টক বাকি: ${formatBengaliNumber(product.stockQuantity)}` : `Only ${product.stockQuantity} left`}
              </span>
            )}
          </div>

          {/* Delivery Discount Badge */}
          {(() => {
            let tiers: any[] = [];
            if (Array.isArray(product.deliveryDiscountTiers)) {
              tiers = product.deliveryDiscountTiers;
            } else if (typeof product.deliveryDiscountTiers === "string") {
              try {
                tiers = JSON.parse(product.deliveryDiscountTiers);
              } catch (e) {}
            }
            if (
              tiers.length === 0 &&
              Number(product.deliveryDiscountMinQty) > 0 &&
              Number(product.deliveryDiscountAmount) > 0
            ) {
              tiers.push({
                minQty: product.deliveryDiscountMinQty,
                discountAmount: product.deliveryDiscountAmount,
              });
            }

            if (tiers.length > 0) {
              const firstTier = tiers[0];
              const maxDisc = Math.max(...tiers.map((t) => Number(t.discountAmount) || 0));
              const minQtyStr = isBn ? formatBengaliNumber(firstTier.minQty) : firstTier.minQty;
              const discAmountStr = isBn ? formatBengaliNumber(firstTier.discountAmount) : firstTier.discountAmount;
              const maxDiscStr = isBn ? formatBengaliNumber(maxDisc) : maxDisc;

              return (
                <div className="mt-1 inline-flex items-center gap-1 text-[8px] sm:text-[9px] text-amber-900 bg-amber-50/90 px-1.5 py-0.5 rounded-md font-semibold border border-amber-200/80 truncate max-w-full">
                  <span className="truncate">
                    🚚 {tiers.length > 1
                      ? isBn
                        ? `${minQtyStr}+ টিতে ৳${discAmountStr} থেকে ৳${maxDiscStr} পর্যন্ত ছাড়`
                        : `${minQtyStr}+ units: ৳${discAmountStr} to ৳${maxDiscStr} off`
                      : isBn
                        ? `${minQtyStr}+ টিতে ৳${discAmountStr} ডেলিভারি ছাড়`
                        : `${minQtyStr}+ units: ৳${discAmountStr} off`}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </Link>

      {/* 3. Price & Action Bar */}
      <div className="pt-2.5 mt-2 border-t border-stone-100 space-y-2">
        {/* Price display */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base lg:text-lg font-extrabold font-mono text-[#0F4A24] leading-none">
            {formatTaka(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs font-mono text-stone-400 line-through leading-none">
              {formatTaka(Number(product.price))}
            </span>
          )}
        </div>

        {/* Dual Actions: Cart Icon + Buy Now Button */}
        <div className="flex items-center gap-1.5">
          {/* Quick Cart Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            title={isBn ? "কার্টে যোগ করুন" : "Add to Cart"}
            className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 border shadow-xs shrink-0 ${
              added
                ? "bg-emerald-600 text-white border-emerald-600 scale-105"
                : "bg-[#F8F6F2] hover:bg-forest/10 border-stone-200 hover:border-forest/40 text-stone-800"
            }`}
            aria-label="Add to cart"
          >
            {added ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 text-forest" />
            )}
          </button>

          {/* Express Order Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 h-8 sm:h-9 rounded-xl font-extrabold text-[11px] sm:text-xs bg-gradient-to-r from-[#0F4A24] to-[#1B6334] hover:from-[#0A381A] hover:to-[#0F4A24] text-white flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm hover:shadow-forest-glow"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <span className="truncate">{isBn ? "অর্ডার করুন" : "Order Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
