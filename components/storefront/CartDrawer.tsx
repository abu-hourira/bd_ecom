"use client";
// components/storefront/CartDrawer.tsx

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatTaka } from "@/lib/utils";

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
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-forest flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-display text-stone-900">{t("cart.title")}</h3>
              <span className="text-xs font-mono font-bold bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 text-stone-600">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-forest" />
                {hasFreeShipping ? (
                  <span>{t("cart.freeShippingUnlocked")}</span>
                ) : (
                  <span>{t("cart.freeShippingNudge", { amount: formatTaka(amountNeededForFreeShipping) })}</span>
                )}
              </span>
              <span className="font-mono text-[11px]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-forest h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-200 mx-auto flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 font-display">{t("cart.emptyTitle")}</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    {t("cart.emptySubtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold shadow-xs cursor-pointer hover:bg-forest-deep"
                >
                  {t("cart.startShopping")}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white border border-stone-200 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-stone-900 truncate">{item.name}</h4>
                    <div className="text-xs font-bold font-mono text-forest mt-0.5">
                      {formatTaka(item.price)} <span className="text-[10px] text-stone-500 font-normal">/ {item.unit}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded-md text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-xs sm:text-sm text-stone-900">
                      {formatTaka(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-mono font-semibold text-stone-900">{formatTaka(cartSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>{t("cart.estimatedDelivery")}</span>
                  <span className="font-mono">{hasFreeShipping ? "ফ্রি" : "৳৭০ (ঢাকায়)"}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>{t("cart.total")}</span>
                  <span className="font-mono text-forest text-base">{formatTaka(cartSubtotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span>{t("cart.proceedCheckout")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
