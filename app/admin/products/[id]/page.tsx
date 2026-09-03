"use client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/products/[id]/page.tsx

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Leaf, Sparkles, Layers, Trash2, Plus } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    subcategory: "",
    price: "",
    discountPrice: "",
    stockQuantity: "0",
    unitQuantity: "",
    unit: "piece",
    weightInGrams: "100",
    deliveryDiscountMinQty: "0",
    deliveryDiscountAmount: "0",
    deliveryDiscountType: "FIXED",
    deliveryDiscountTiers: [] as Array<{ minQty: string | number; discountAmount: string | number }>,
    images: [] as string[],
    description: "",
    shortDescription: "",
    organicCertified: true,
    isCombo: false,
    savingsPercentage: "",
    badge: "",
    featured: false,
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
    ])
      .then(([catData, prodData]) => {
        if (catData.success) setCategories(catData.categories);
        if (prodData.success) {
          const p = prodData.product;
          let parsedTiers = [];
          if (Array.isArray(p.deliveryDiscountTiers)) {
            parsedTiers = p.deliveryDiscountTiers;
          } else if (typeof p.deliveryDiscountTiers === "string") {
            try {
              parsedTiers = JSON.parse(p.deliveryDiscountTiers);
            } catch (e) {}
          }
          if (parsedTiers.length === 0 && Number(p.deliveryDiscountMinQty) > 0 && Number(p.deliveryDiscountAmount) > 0) {
            parsedTiers.push({ minQty: p.deliveryDiscountMinQty, discountAmount: p.deliveryDiscountAmount });
          }

          setFormData({
            name: p.name || "",
            categoryId: p.categoryId ? String(p.categoryId) : "",
            subcategory: p.subcategory || "",
            price: String(p.price || ""),
            discountPrice: p.discountPrice ? String(p.discountPrice) : "",
            stockQuantity: String(p.stockQuantity || 0),
            unitQuantity:
              p.unitQuantity !== null && p.unitQuantity !== undefined
                ? String(p.unitQuantity)
                : p.unit_quantity !== null && p.unit_quantity !== undefined
                ? String(p.unit_quantity)
                : "",
            unit: p.unit || "piece",
            weightInGrams: String(p.weightInGrams || p.weight_in_grams || 100),
            deliveryDiscountMinQty: String(p.deliveryDiscountMinQty || p.delivery_discount_min_qty || 0),
            deliveryDiscountAmount: String(p.deliveryDiscountAmount || p.delivery_discount_amount || 0),
            deliveryDiscountType: p.deliveryDiscountType || p.delivery_discount_type || "FIXED",
            deliveryDiscountTiers: parsedTiers,
            images: Array.isArray(p.images) ? p.images : [],
            description: p.description || "",
            shortDescription: p.shortDescription || "",
            organicCertified: Boolean(p.organicCertified),
            isCombo: Boolean(p.isCombo),
            savingsPercentage: p.savingsPercentage ? String(p.savingsPercentage) : "",
            badge: p.badge || "",
            featured: Boolean(p.featured),
            isActive: Boolean(p.isActive),
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setAlertState({
        isOpen: true,
        title: "Validation Error",
        message: "Product name and regular price are required fields.",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update product");
      }

      router.push("/admin/products");
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        title: "Save Error",
        message: error.message || "Failed to update product.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/products");
      } else {
        setAlertState({
          isOpen: true,
          title: "Delete Error",
          message: json.error || "Failed to delete product.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Delete Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
        <span className="ml-3 font-medium">Loading product details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-line bg-paper text-ink-soft hover:text-ink hover:bg-bg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold font-display text-ink">Edit Product #{id}</h2>
            <p className="text-xs text-ink-soft">Update product information and image gallery.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-xl border border-line bg-paper hover:bg-rose-50 text-ink-soft hover:text-rose-600 transition-colors"
            title="Move to Recycle Bin"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Subcategory / Variant</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          </div>
        </div>

        {/* Gallery */}
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

        {/* Pricing & Stock */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Regular Price (৳) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Discount Price (৳) (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            {/* Side-by-side Unit Quantity & Measurement Unit */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Unit Quantity / Net Weight</label>
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
              <label className="block text-sm font-semibold text-ink">Measurement Unit</label>
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

            {/* Product-Level Multi-Tier Delivery Discount Promotion */}
            <div className="sm:col-span-2 p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <span>🚚 বিভিন্ন পরিমাণ/ওজনে একাধিক ডেলিভারি ডিসকাউন্ট স্ল্যাব (Multi-Tier Offers)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextMin = (formData.deliveryDiscountTiers.length + 1) * 2;
                    const nextDisc = (formData.deliveryDiscountTiers.length + 1) * 20;
                    setFormData({
                      ...formData,
                      deliveryDiscountTiers: [
                        ...formData.deliveryDiscountTiers,
                        { minQty: nextMin, discountAmount: nextDisc },
                      ],
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ নতুন স্ল্যাব যোগ করুন</span>
                </button>
              </div>

              <p className="text-xs text-amber-800/80">
                এই পণ্যে গ্রাহককে একাধিক পরিমাণে ক্রয়ের ওপর বিভিন্ন মাত্রার ডেলিভারি ছাড় দিতে পারেন (যেমন: ২ পিস নিলে ৳২০ ছাড়, ৫ পিস নিলে ৳৫০ ছাড়, ১০ পিস নিলে ৳১০০ ছাড়)।
              </p>

              {formData.deliveryDiscountTiers.length === 0 ? (
                <div className="text-center py-4 px-3 rounded-xl bg-amber-100/40 border border-dashed border-amber-300 text-xs text-amber-800">
                  বর্তমানে কোনো ডিসকাউন্ট স্ল্যাব নেই। <strong>"+ নতুন স্ল্যাব যোগ করুন"</strong> বাটনে ক্লিক করে অফার তৈরি করুন।
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.deliveryDiscountTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs"
                    >
                      <div className="sm:col-span-5 space-y-1">
                        <label className="block text-[11px] font-semibold text-stone-700">
                          মিনিমাম পরিমাণ/ওজন (পিস বা কেজি)
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 2, 5, 10"
                          value={tier.minQty}
                          onChange={(e) => {
                            const updated = [...formData.deliveryDiscountTiers];
                            updated[idx].minQty = e.target.value;
                            setFormData({ ...formData, deliveryDiscountTiers: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-5 space-y-1">
                        <label className="block text-[11px] font-semibold text-stone-700">
                          ডেলিভারি ছাড়ের পরিমাণ (৳)
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 20, 50, 100"
                          value={tier.discountAmount}
                          onChange={(e) => {
                            const updated = [...formData.deliveryDiscountTiers];
                            updated[idx].discountAmount = e.target.value;
                            setFormData({ ...formData, deliveryDiscountTiers: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end pt-3 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.deliveryDiscountTiers.filter((_, i) => i !== idx);
                            setFormData({ ...formData, deliveryDiscountTiers: updated });
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="রিমুভ করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">Badge / Tag (Optional)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          </div>
        </div>

        {/* Descriptions & Toggles */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3">
            Descriptions & Flags
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Short Summary</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Detailed Description</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-line">
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
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-bg border border-line cursor-pointer hover:bg-forest-soft/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-forest rounded focus:ring-forest"
                />
                <div className="text-xs font-semibold text-ink">Featured on Home</div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-bg border border-line cursor-pointer hover:bg-forest-soft/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isCombo}
                  onChange={(e) => setFormData({ ...formData, isCombo: e.target.checked })}
                  className="w-4 h-4 text-forest rounded focus:ring-forest"
                />
                <div className="text-xs font-semibold text-ink">Combo / Bundle Deal</div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-bg border border-line cursor-pointer hover:bg-forest-soft/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-forest rounded focus:ring-forest"
                />
                <div className="text-xs font-semibold text-ink">Active in Storefront</div>
              </label>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Move Product to Recycle Bin?"
        message={`Are you sure you want to remove "${formData.name}" from active catalog?\n\nThis will archive the item to the recycle bin with 1-click restore enabled.`}
        confirmText="Move to Recycle Bin"
        cancelText="Keep Editing"
        type="danger"
        isLoading={deleting}
        requireSafetyDelay={true}
      />

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
