// components/storefront/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Leaf, Star, Check } from "lucide-react";
import { formatTaka, getProductImages } from "@/lib/utils";
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
  const imageSrc = images[0];

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
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 flex flex-col justify-between hover:border-forest/50 hover:shadow-md transition-all duration-300">
      {/* Top Image & Badges */}
      <div className="space-y-3">
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-50 border border-stone-100 block"
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={true}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.organicCertified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                <Leaf className="w-2.5 h-2.5 text-accent" />
                <span>{t("products.organicBadge")}</span>
              </span>
            )}
            {hasDiscount && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                {discountPercent}% {t("products.save")}
              </span>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="space-y-1 px-0.5">
          {product.category && (
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
              {product.category.name}
            </span>
          )}

          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-forest transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 text-xs pt-0.5">
            <Star className="w-3 h-3 fill-amber-500" />
            <span className="font-bold text-stone-800 text-[11px]">4.9</span>
            <span className="text-stone-400 text-[10px]">
              ({t("products.verified")})
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2 px-0.5">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-base sm:text-lg text-stone-900">
              {formatTaka(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through font-mono">
                {formatTaka(product.price)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 block font-mono">
            {t("products.per")} {product.unit || "পিস"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer active:scale-95 ${
            added
              ? "bg-emerald-700 text-white"
              : "bg-forest hover:bg-forest-deep text-white hover:scale-105"
          }`}
          title={t("products.add")}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t("products.verified")}
              </span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("products.add")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
