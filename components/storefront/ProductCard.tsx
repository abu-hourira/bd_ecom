"use client";
// components/storefront/ProductCard.tsx - Ultra-Polished Mobile & Desktop Product Card

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Leaf, Check, Sparkles } from "lucide-react";
import { formatTaka, getProductImages, getSafeImageUrl, formatProductUnit } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t, locale } = useLanguage();
  const [added, setAdded] = useState(false);

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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 hover:border-forest/40 p-2.5 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden active:scale-[0.99]">
      {/* 1. Product Image & Badges */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF8F5] border border-stone-100 mb-2.5 sm:mb-3 group-hover:scale-[1.02] transition-transform duration-300">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover object-center p-1 sm:p-2"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges: Organic & Discount */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10">
            {product.isOrganic && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-[#143520]/90 backdrop-blur-xs text-amber-300 text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                <Leaf className="w-2.5 h-2.5 text-amber-400" />
                <span>{locale === "bn" ? "অর্গানিক" : "Organic"}</span>
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[9px] sm:text-[10px] font-black tracking-tight shadow-xs">
                -{discountPercent}%
              </span>
            </div>
          )}

          {product.isCombo && (
            <div className="absolute bottom-1.5 left-1.5 z-10">
              <span className="px-1.5 py-0.5 rounded-md bg-forest text-white text-[8px] sm:text-[9px] font-bold shadow-xs">
                {locale === "bn" ? "কম্বো অফার" : "Combo"}
              </span>
            </div>
          )}
        </div>

        {/* 2. Category & Title */}
        <div className="space-y-1">
          {product.category?.name && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 block truncate">
              {product.category.name}
            </span>
          )}

          <h3 className="font-display font-bold text-xs sm:text-sm text-stone-900 group-hover:text-forest line-clamp-2 leading-snug min-h-[32px] sm:min-h-[38px] transition-colors">
            {product.name}
          </h3>

          {formattedUnit && (
            <span className="text-[10px] sm:text-xs text-stone-500 font-medium block">
              {formattedUnit}
            </span>
          )}

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

            if (tiers.length > 0) {
              const firstTier = tiers[0];
              const maxDisc = Math.max(...tiers.map((t) => Number(t.discountAmount) || 0));
              return (
                <div className="mt-1 inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-850 bg-amber-50/90 px-1.5 py-0.5 rounded-md font-semibold border border-amber-200/80 truncate">
                  <span>
                    🚚 {tiers.length > 1
                      ? `${firstTier.minQty}+ টিতে ৳${firstTier.discountAmount} থেকে ৳${maxDisc} পর্যন্ত ছাড়`
                      : `${firstTier.minQty}+ টিতে ৳${firstTier.discountAmount} ডেলিভারি ছাড়`}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </Link>

      {/* 3. Price & Add to Cart Button */}
      <div className="pt-2.5 sm:pt-3 mt-1 sm:mt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-base font-extrabold font-mono text-forest leading-none">
              {formatTaka(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-[9px] sm:text-[11px] font-mono text-stone-400 line-through leading-none">
                {formatTaka(Number(product.price))}
              </span>
            )}
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleAdd}
          className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-90 shrink-0 shadow-xs ${
            added
              ? "bg-emerald-600 text-white scale-95"
              : "bg-forest hover:bg-forest-deep text-white"
          }`}
          aria-label="Add to cart"
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{locale === "bn" ? "যোগ হয়েছে" : "Added"}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">{locale === "bn" ? "কিনুন" : "Add"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
