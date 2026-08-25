"use client";

// components/storefront/ProductCardSkeleton.tsx - Pixel-Perfect Shimmer Loading State

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-2.5 sm:p-4 flex flex-col justify-between shadow-xs relative overflow-hidden animate-pulse">
      {/* 1. Image Placeholder */}
      <div>
        <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100 mb-2.5 sm:mb-3 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>

        {/* 2. Category & Title Placeholder */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 bg-stone-200/80 rounded-md" />
          <div className="h-3.5 sm:h-4 w-4/5 bg-stone-200/80 rounded-md" />
          <div className="h-3 sm:h-3.5 w-3/5 bg-stone-200/60 rounded-md" />
          <div className="h-2.5 w-10 bg-stone-200/60 rounded-md pt-0.5" />
        </div>
      </div>

      {/* 3. Price & Add to Cart Footer */}
      <div className="pt-2.5 sm:pt-3 mt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
        <div className="h-4 sm:h-5 w-14 sm:w-16 bg-stone-200/80 rounded-md" />
        <div className="h-6 sm:h-7 w-8 sm:w-14 bg-stone-200/80 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
