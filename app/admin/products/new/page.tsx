"use client";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/products/new/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Leaf, Sparkles, Layers } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function NewProductPage() {
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    subcategory: "",
    price: "",
    discountPrice: "",
    stockQuantity: "50",
    unitQuantity: "",
    unit: "piece",
    weightInGrams: "100",
    deliveryDiscountMinQty: "0",
    deliveryDiscountAmount: "0",
    deliveryDiscountType: "FIXED",
    images: [] as string[],
    description: "",
    shortDescription: "",
    organicCertified: true,
    isCombo: false,
    savingsPercentage: "",
    badge: "",
    featured: false,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: String(data.categories[0].id) }));
          }
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setAlertState({
        isOpen: true,
        title: "Missing Required Fields",
        message: "Please fill in the product name and regular price before saving.",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create product");
      }

      router.push("/admin/products");
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        title: "Creation Error",
        message: error.message || "Failed to create product.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button + Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-line bg-paper text-ink-soft hover:text-ink hover:bg-bg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold font-display text-ink">Add New Organic Product</h2>
            <p className="text-xs text-ink-soft">
              Fill in product details, pricing, and direct photo uploads.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Publish Product</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span>Core Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sundarban Raw Wild Honey (500g)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Subcategory / Variant (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mustard Flower, Raw Wild"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          </div>
        </div>

        {/* Media & Unlimited Gallery Upload */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-forest" />
            <span>Product Photography (Direct Device Upload)</span>
          </h3>

          <ImageUploader
            images={formData.images}
            onChange={(newImages) => setFormData({ ...formData, images: newImages })}
            multiple={true}
            label="Product Gallery"
            helperText="Direct upload from computer or phone file picker. Drag-and-drop supported. No limit on photo count."
          />
        </div>

        {/* Pricing & Stock Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Regular Price (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="650"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Discount Price (৳) (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="580"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            {/* Side-by-side Unit Quantity & Measurement Unit */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Unit Quantity / Net Weight
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 500, 1.5, 2"
                value={formData.unitQuantity}
                onChange={(e) => setFormData({ ...formData, unitQuantity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <p className="text-[11px] text-ink-soft">Specific weight/volume per item (e.g. 500)</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Measurement Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="g">g (Gram)</option>
                <option value="kg">kg (Kilogram)</option>
                <option value="ml">ml (Milliliter)</option>
                <option value="L">L (Liter)</option>
                <option value="piece">Piece (Bottle/Jar/Pack)</option>
                <option value="bundle">Bundle / Combo Pack</option>
              </select>
              <p className="text-[11px] text-ink-soft">Unit metric (e.g. g, kg, L)</p>
            </div>

            {/* Shipping Weight in Grams */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">
                Shipping Weight in Grams (গ্রামে ওজন) <span className="text-emerald-700 font-normal text-xs">• ব্যবহৃত হবে ডেলিভারি চার্জ নির্ধারণে</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 100 for a ruti, 500 for honey jar, 1000 for 1L oil"
                value={formData.weightInGrams}
                onChange={(e) => setFormData({ ...formData, weightInGrams: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <p className="text-[11px] text-ink-soft">
                প্রতি ইউনিটের ওজন গ্রামে লিখুন (যেমন: ১ পিস রুটি = ১০০ গ্রাম, ১ লিটার তেল = ১০০০ গ্রাম)। ১০ পিস নিলে কার্টের ওজন স্বয়ংক্রিয়ভাবে ১ কেজি হবে।
              </p>
            </div>

            {/* Product-Level Delivery Discount Promotion */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span>🚚 ওজনের ওপর ভিত্তি করে ডেলিভারি ডিসকাউন্ট (ঐচ্ছিক)</span>
              </div>
              <p className="text-xs text-amber-800/80">
                নির্দিষ্ট পরিমাণ বা ওজনে এই পণ্য কিনলে ডেলিভারি চার্জে বিশেষ ছাড় সেট করুন। (যেমন: ৩ পিস বা ৩ কেজি নিলে ডেলিভারি চার্জে ৳৩০ ছাড়)।
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800">
                    মিনিমাম ক্রয়ের পরিমাণ (পিস/প্যাক)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3 (0 = কোনো অফার নেই)"
                    value={formData.deliveryDiscountMinQty}
                    onChange={(e) => setFormData({ ...formData, deliveryDiscountMinQty: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="text-[10px] text-stone-500">গ্রাহক এই সংখ্যা বা এর বেশি অর্ডার করলে ছাড় পাবে</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800">
                    ডেলিভারি চার্জে ছাড়ের পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 30 (টাকা ছাড়)"
                    value={formData.deliveryDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, deliveryDiscountAmount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="text-[10px] text-stone-500">ডেলিভারি বিল থেকে যত টাকা ছাড় পাবে</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Best Seller, Sale, New"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          </div>
        </div>

        {/* Descriptions & Badges */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3">
            Product Descriptions & Badges
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Short Summary (For Product Cards & Quick View)
              </label>
              <input
                type="text"
                placeholder="Brief 1-sentence product summary"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Detailed Description & Health Benefits
              </label>
              <textarea
                rows={5}
                placeholder="Detailed nutritional info, sourcing origin, usage instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-bg border border-line cursor-pointer hover:bg-forest-soft/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.organicCertified}
                  onChange={(e) =>
                    setFormData({ ...formData, organicCertified: e.target.checked })
                  }
                  className="w-4 h-4 text-forest rounded focus:ring-forest"
                />
                <div>
                  <div className="text-xs font-semibold text-ink flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-forest" />
                    Organic Certified
                  </div>
                  <div className="text-[10px] text-ink-soft">Shows organic purity badge</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-bg border border-line cursor-pointer hover:bg-forest-soft/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-forest rounded focus:ring-forest"
                />
                <div>
                  <div className="text-xs font-semibold text-ink">Featured on Home</div>
                  <div className="text-[10px] text-ink-soft">Show in top recommendations</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-bg border border-line cursor-pointer hover:bg-forest-soft/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isCombo}
                  onChange={(e) => setFormData({ ...formData, isCombo: e.target.checked })}
                  className="w-4 h-4 text-forest rounded focus:ring-forest"
                />
                <div>
                  <div className="text-xs font-semibold text-ink">Combo / Bundle Deal</div>
                  <div className="text-[10px] text-ink-soft">Special bundle discount deal</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 rounded-xl border border-line bg-paper text-ink font-medium text-sm hover:bg-bg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Publish Product</span>
          </button>
        </div>
      </form>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
}
