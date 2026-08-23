// app/account/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  Loader2,
  Sparkles,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import AccountNav from "@/components/account/AccountNav";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatTaka } from "@/lib/utils";

export default function CustomerWishlistPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { addToCart } = useCart();

  const [customer, setCustomer] = useState<any>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = (userId: number) => {
    fetch(`/api/account/wishlist?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWishlist(data.wishlist || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("enmar_customer");
      if (!stored) {
        router.push("/auth/login");
        return;
      }
      const parsed = JSON.parse(stored);
      setCustomer(parsed);
      if (parsed.id) {
        fetchWishlist(parsed.id);
      }
    } catch (e) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleRemove = async (productId: number) => {
    if (!customer?.id) return;
    try {
      await fetch(`/api/account/wishlist?userId=${customer.id}&productId=${productId}`, {
        method: "DELETE",
      });
      fetchWishlist(customer.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/assets/products/honey-sundarban.jpg",
      stockQuantity: product.stockQuantity,
      unit: product.unit,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 w-full space-y-6">
            <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
              <div className="border-b border-line pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-ink">
                    {lang === "bn" ? "আমার সংরক্ষিত উইশলিস্ট" : "My Saved Wishlist"}
                  </h1>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {lang === "bn"
                      ? "আপনার পছন্দের খাঁটি অর্গানিক পণ্যসমূহ সেভ করে রাখুন"
                      : "Saved items to purchase later"}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-bg px-3 py-1 rounded-full border border-line">
                  {wishlist.length} {lang === "bn" ? "পণ্য" : "Items"}
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-ink-soft">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
                  <span>Loading wishlist...</span>
                </div>
              ) : wishlist.length === 0 ? (
                <div className="p-12 text-center text-ink-soft space-y-3">
                  <Heart className="w-10 h-10 mx-auto text-rose-500/30" />
                  <p className="text-sm font-semibold text-ink">
                    {lang === "bn" ? "আপনার উইশলিস্ট খালি" : "Your wishlist is empty"}
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex px-5 py-2 rounded-full bg-forest text-white text-xs font-semibold"
                  >
                    {lang === "bn" ? "অর্গানিক ফুড ব্রাউজ করুন" : "Browse Products"}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => {
                    const p = item.product;
                    const price = p.discountPrice ? Number(p.discountPrice) : Number(p.price);
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-bg border border-line flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-16 h-16 rounded-xl bg-paper border border-line flex items-center justify-center font-bold text-forest font-display shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <Link
                              href={`/products/${p.slug}`}
                              className="text-xs font-bold text-ink hover:text-forest truncate block"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] text-ink-soft font-mono">
                              {p.unit}
                            </span>
                            <div className="text-xs font-bold font-mono text-forest mt-0.5">
                              {formatTaka(price)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="p-2 rounded-xl bg-forest text-white hover:bg-forest-deep transition-all shadow-xs"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(p.id)}
                            className="p-2 rounded-xl border border-line text-rose-500 hover:bg-rose-50 transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
