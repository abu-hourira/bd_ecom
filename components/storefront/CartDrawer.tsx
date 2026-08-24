"use client";
// components/storefront/CartDrawer.tsx - Polished Mobile & Desktop Cart Drawer

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Truck, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatTaka, getSafeImageUrl } from "@/lib/utils";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    hasFreeShipping,
  } = useCart();

  const { t, locale } = useLanguage();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* 1. Header */}
          <div className="p-3.5 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-forest text-amber-400 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm sm:text-base text-stone-900 leading-none">
                  {locale === "bn" ? "আপনার শপিং কার্ট" : "Your Shopping Cart"}
                </h2>
                <span className="text-[11px] text-stone-500 font-mono">
                  {cart.length} {locale === "bn" ? "টি আইটেম" : "items"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl hover:bg-stone-200/80 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Free Shipping Threshold Bar */}
          <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-stone-200 text-xs">
            {hasFreeShipping ? (
              <div className="flex items-center gap-1.5 text-forest font-bold text-[11px] sm:text-xs">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>{locale === "bn" ? "অভিনন্দন! আপনি পাচ্ছেন ফ্রি ডেলিভারি!" : "Congratulations! You get Free Delivery!"}</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-stone-600 font-medium">
                  <span>{locale === "bn" ? `আর ${formatTaka(amountNeededForFreeShipping)} কিনলে ফ্রি ডেলিভারি!` : `Add ${formatTaka(amountNeededForFreeShipping)} more for Free Shipping!`}</span>
                  <span className="font-mono font-bold text-forest">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-forest rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-stone-800 text-sm sm:text-base">
                  {locale === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  {locale === "bn" ? "পছন্দের পণ্য কার্টে যোগ করে সহজে অর্ডার সম্পন্ন করুন।" : "Add products from our organic pantry to proceed."}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-xs hover:bg-forest-deep transition-all cursor-pointer"
                >
                  <span>{locale === "bn" ? "কেনাকাটা শুরু করুন" : "Start Shopping"}</span>
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const imageSrc = item.image ? getSafeImageUrl(item.image) : "/placeholder.png";
                const price = Number(item.discountPrice || item.price);

                return (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden shrink-0">
                      <Image
                        src={imageSrc}
                        alt={item.name}
                        fill
                        className="object-cover p-1"
                        sizes="64px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono block">
                        {item.unit || ""}
                      </span>
                      <span className="font-mono font-bold text-xs text-forest">
                        {formatTaka(price)}
                      </span>
                    </div>

                    {/* Stepper & Remove */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-mono font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-3.5 sm:p-5 border-t border-stone-200 bg-[#FAF8F5] space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-stone-600">{locale === "bn" ? "মোট মূল্য (Subtotal):" : "Subtotal:"}</span>
                <span className="font-mono font-extrabold text-base text-forest">
                  {formatTaka(cartSubtotal)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>{locale === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 text-center text-stone-600 hover:text-stone-900 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {locale === "bn" ? "আরও কেনাকাটা করুন" : "Continue Shopping"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
