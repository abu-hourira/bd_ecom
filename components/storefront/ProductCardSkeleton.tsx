"use client";

// components/storefront/ProductCardSkeleton.tsx - Pixel-Perfect Shimmer Loading State

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl border border-stone-200/80 p-1.5 sm:p-2.5 md:p-3 flex flex-col justify-between shadow-2xs relative overflow-hidden animate-pulse">
      {/* 1. Image Placeholder */}
      <div>
        <div className="relative w-full aspect-square rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100 mb-1.5 sm:mb-2.5 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>

        {/* 2. Category & Title Placeholder */}
        <div className="space-y-1">
          <div className="h-2 w-12 bg-stone-200/80 rounded" />
          <div className="h-3 w-4/5 bg-stone-200/80 rounded" />
          <div className="h-2.5 w-3/5 bg-stone-200/60 rounded" />
        </div>
      </div>

      {/* 3. Price & Add to Cart Footer */}
      <div className="pt-1.5 sm:pt-2 mt-1.5 border-t border-stone-100 flex items-center justify-between gap-1">
        <div className="h-3.5 sm:h-4 w-10 sm:w-14 bg-stone-200/80 rounded" />
        <div className="h-6 sm:h-8 w-12 sm:w-16 bg-stone-200/80 rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
