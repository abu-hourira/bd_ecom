"use client";
// app/recipes/[slug]/page.tsx - Interactive Single Recipe & 1-Click Bundle Carting
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  Users,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ChevronLeft,
  Heart,
  Share2,
  ShieldCheck,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SingleRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { lang } = useLanguage();

  const [recipe, setRecipe] = useState<any>(null);
  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [bundleAdded, setBundleAdded] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/storefront/recipes/${slug}`);
        const data = await res.json();
        if (data.success && data.recipe) {
          setRecipe(data.recipe);
          setLinkedProducts(data.linkedProducts || []);
          // Preselect all products
          if (Array.isArray(data.linkedProducts)) {
            setSelectedProductIds(data.linkedProducts.map((p: any) => p.id));
          }
        }
      } catch (e) {
        console.error("Error fetching recipe:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [slug]);

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedProducts = linkedProducts.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  const bundleSubtotal = selectedProducts.reduce(
    (acc, p) => acc + Number(p.discountPrice || p.price || 0),
    0
  );

  // Bundle discount if all products selected
  const discountPercent = Number(recipe?.bundleDiscountPercent || 10);
  const isFullBundle =
    linkedProducts.length > 1 &&
    selectedProducts.length === linkedProducts.length;
  const bundleDiscount = isFullBundle
    ? Math.round(bundleSubtotal * (discountPercent / 100))
    : 0;
  const finalBundlePrice = bundleSubtotal - bundleDiscount;

  const handleAddAllToCart = () => {
    if (selectedProducts.length === 0) return;

    selectedProducts.forEach((p) => {
      addToCart(p, 1);
    });

    setBundleAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-ink">রেসিপি পাওয়া যায়নি</h2>
        <Link
          href="/recipes"
          className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold"
        >
          সকল রেসিপি দেখুন
        </Link>
      </div>
    );
  }

  const instructions = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : [];

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-line py-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-forest transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>সকল রেসিপি ও ভেষজ যত্ন</span>
          </Link>

          <span className="text-[11px] font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-full uppercase">
            {recipe.category === "herbal_remedy" ? "🌿 ভেষজ চিকিৎসা" : "🍳 স্বাস্থ্যকর রান্না"}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Recipe Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-line shadow-xs space-y-6">
              <div className="h-64 sm:h-80 rounded-2xl bg-stone-100 overflow-hidden relative">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Utensils className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.prepTimeMinutes} মিনিট
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {recipe.servings} পরিবেশন
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-tight">
                  {recipe.title}
                </h1>
                
                {recipe.healthBenefits && (
                  <div className="p-4 rounded-2xl bg-forest/5 border border-forest/15 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>প্রাকৃতিক উপকারিতা ও গুণাগুণ</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                      {recipe.healthBenefits}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preparation Steps */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-line shadow-xs space-y-6">
              <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                <Utensils className="w-5 h-5 text-forest" />
                <span>প্রস্তুত ও সেবন প্রণালী</span>
              </h2>

              <div className="space-y-4">
                {instructions.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-2xl bg-stone-50/80 border border-stone-100 items-start"
                  >
                    <div className="w-8 h-8 rounded-xl bg-forest text-white font-display font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                        {step.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky 1-Click Ingredients Cart Bundle (Right Col) */}
          <div className="lg:col-span-1 sticky top-24 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-forest/30 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-forest via-accent to-forest" />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ১-ক্লিকে রেসিপি কম্বো
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      {discountPercent}% ছাড়
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold font-display text-ink">
                  প্রয়োজনীয় খাঁটি উপাদানসমূহ
                </h3>
                <p className="text-xs text-stone-500">
                  রেসিপির উপাদানগুলো একসাথে কিনুন এবং বিশেষ সেভিংস উপভোগ করুন:
                </p>
              </div>

              {/* Product Checkboxes */}
              <div className="space-y-2.5">
                {linkedProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  let img = "/placeholder.png";
                  if (Array.isArray(p.images) && p.images.length > 0) img = p.images[0];
                  else if (typeof p.images === "string") img = p.images;

                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProductSelection(p.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-forest/5 border-forest/40 shadow-xs"
                          : "bg-stone-50 border-stone-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? "bg-forest border-forest text-white"
                              : "border-stone-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>

                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0">
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {p.unitQuantity || 1} {p.unit}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-forest">
                          ৳{p.discountPrice || p.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>উপাদানগুলোর মূল্য ({selectedProducts.length}টি):</span>
                  <span>৳{bundleSubtotal}</span>
                </div>
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>রেসিপি কম্বো সেভিংস ({discountPercent}%):</span>
                    <span>-৳{bundleDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-ink pt-1 border-t border-stone-100">
                  <span>সর্বমোট মূল্য:</span>
                  <span className="text-forest text-lg">৳{finalBundlePrice}</span>
                </div>
              </div>

              {/* 1-Click Add to Cart Button */}
              <button
                onClick={handleAddAllToCart}
                disabled={selectedProducts.length === 0}
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                  bundleAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-forest hover:bg-forest-deep text-white shadow-forest/30"
                }`}
              >
                {bundleAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>কার্টে যোগ করা হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>সব উপাদান একসাথে কার্ট করুন (৳{finalBundlePrice})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
