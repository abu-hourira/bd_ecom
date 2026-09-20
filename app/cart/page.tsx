"use client";
// app/cart/page.tsx - Dedicated Full Page Shopping Cart

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowLeft,
  Flame,
  MessageCircle,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStorefront } from "@/context/StorefrontContext";
import { formatTaka, getSafeImageUrl } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    hasFreeShipping,
    freeShippingThreshold,
    amountNeededForFreeShipping,
  } = useCart();
  const { locale } = useLanguage();
  const isBn = locale === "bn";
  const { settings } = useStorefront();

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const rawPhone = settings?.whatsappNumber || settings?.contactPhone || "01700000000";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "88" + cleanPhone;

    const itemsSummary = cart
      .map((it) => `• ${it.name} (x${it.quantity} ${it.unit || "পিস"}) - ৳${Number(it.discountPrice || it.price) * it.quantity}`)
      .join("\n");

    const msg = `আসসালামু আলাইকুম! 🌿\nআমি ENMAR থেকে এই পণ্যগুলো অর্ডার করতে চাই:\n\n🛒 কার্ট তালিকা:\n${itemsSummary}\n\n💰 সর্বমোট পণ্যমূল্য: ৳${cartSubtotal}\n\nঅনুগ্রহ করে আমার অর্ডারটি কনফার্ম করুন।`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between font-sans">
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Page Breadcrumb & Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-forest" />
              <span>{isBn ? "আপনার শপিং কার্ট" : "Your Shopping Cart"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {cart.length > 0
                ? isBn
                  ? `আপনার কার্টে ${cart.length}টি পণ্য রয়েছে`
                  : `You have ${cart.length} items in your bag`
                : isBn
                ? "কার্ট বর্তমানে খালি"
                : "Your bag is currently empty"}
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-forest hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? "আরও পণ্য দেখুন" : "Continue Shopping"}</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs max-w-lg mx-auto space-y-4">
            <div className="w-20 h-20 bg-[#FBF4EA] text-forest rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              🛒
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900">
              {isBn ? "আপনার কার্ট সম্পূর্ণ খালি" : "Your cart is currently empty"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              {isBn
                ? "আমাদের ফ্রোজেন রুটি, মোমো, সিঙ্গারা ও মুখরোচক স্ন্যাক্স দেখতে মেন্যুতে ঘুরে আসুন।"
                : "Explore our freshly frozen rotis, leaf momos, crispy spring rolls and family deals."}
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-forest hover:bg-forest-deep text-white font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{isBn ? "ফ্রোজেন মেন্যু দেখুন" : "Browse Frozen Menu"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Nudge Progress */}
              <div className="bg-[#FAF4EB] border border-amber-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-900">
                  <span className="flex items-center gap-1.5 text-forest">
                    <Truck className="w-4 h-4 text-forest shrink-0" />
                    {hasFreeShipping ? (
                      <span className="text-emerald-700 font-extrabold">
                        🎉 {isBn ? "অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!" : "Free Delivery Unlocked!"}
                      </span>
                    ) : (
                      <span>
                        {isBn
                          ? `আর মাত্র ${formatTaka(amountNeededForFreeShipping)} টাকার অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি!`
                          : `Add ${formatTaka(amountNeededForFreeShipping)} more for Free Delivery!`}
                      </span>
                    )}
                  </span>
                </div>
                <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (cartSubtotal / (freeShippingThreshold || 1500)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card divide-y divide-stone-100 overflow-hidden">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex items-center gap-3 sm:gap-5 hover:bg-stone-50/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSafeImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                    </div>

                    {/* Title & Unit Price */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug || item.id}`}
                        className="text-xs sm:text-sm font-bold text-stone-900 hover:text-forest transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-extrabold text-forest">
                          {formatTaka(Number(item.discountPrice || item.price))}
                        </span>
                        {item.unit && (
                          <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-100 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs cursor-pointer shadow-2xs active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-mono font-bold text-xs sm:text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs cursor-pointer shadow-2xs active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right shrink-0 min-w-[70px]">
                      <span className="block text-xs sm:text-sm font-mono font-black text-stone-900">
                        {formatTaka(
                          Number(item.discountPrice || item.price) * item.quantity
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-rose-600 hover:underline mt-0.5 cursor-pointer"
                      >
                        {isBn ? "মুছুন" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Action */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-stone-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBn ? "পুরো কার্ট খালি করুন" : "Clear entire bag"}</span>
                </button>
              </div>
            </div>

            {/* Right Col: Order Summary & Checkout Action */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-card space-y-4 sticky top-24">
              <h3 className="text-base font-bold font-display text-stone-900 pb-3 border-b border-stone-100">
                {isBn ? "অর্ডার সারাংশ" : "Order Summary"}
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>{isBn ? "পণ্যের মোট মূল্য (Subtotal):" : "Subtotal:"}</span>
                  <span className="font-mono font-bold text-stone-900">
                    {formatTaka(cartSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>{isBn ? "ডেলিভারি চার্জ:" : "Estimated Delivery:"}</span>
                  <span className="font-mono font-bold text-stone-900">
                    {hasFreeShipping ? (
                      <span className="text-emerald-700">{isBn ? "ফ্রি" : "FREE"}</span>
                    ) : (
                      isBn ? "চেকআউটে নির্ধারিত হবে" : "Calculated at checkout"
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm sm:text-base text-stone-900">
                    {isBn ? "সর্বমোট (আনুমানিক):" : "Grand Total:"}
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono text-forest">
                    {formatTaka(cartSubtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-forest to-forest-light hover:from-forest-deep hover:to-forest text-white font-extrabold text-sm sm:text-base shadow-lg transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isBn ? "চেকআউটে এগিয়ে যান" : "Proceed to Checkout"}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>

              {/* WhatsApp Quick Checkout */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-stone-950 text-stone-950" />
                <span>{isBn ? "📲 হোয়াটসঅ্যাপে অর্ডার দিন" : "📲 Order via WhatsApp"}</span>
              </button>

              {/* Trust Badges */}
              <div className="pt-2 text-[11px] text-stone-500 space-y-1.5 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                  <span>{isBn ? "১০০% নিরাপদ ক্যাশ অন ডেলিভারি" : "Cash on Delivery Available"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-forest" />
                  <span>{isBn ? "সারাদেশে দ্রুত ও সতেজ ফ্রোজেন ডেলিভারি" : "Fast & Fresh Delivery"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
