"use client";
// app/admin/recipes/page.tsx
import { useEffect, useState } from "react";
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  HeartPulse,
  Save,
  Loader2,
  X,
  Eye,
  CheckCircle,
  Package,
} from "lucide-react";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminRecipesPage() {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);

  const [form, setForm] = useState({
    id: null,
    title: "",
    slug: "",
    imageUrl: "",
    category: "healthy_cooking",
    prepTimeMinutes: "15",
    servings: "4",
    difficulty: "Easy",
    healthBenefits: "",
    instructions: [
      { stepNumber: 1, title: "ধাপ ১", description: "" },
      { stepNumber: 2, title: "ধাপ ২", description: "" },
    ],
    linkedProductIds: [] as number[],
    bundleDiscountPercent: "5",
    isFeatured: false,
    isActive: true,
  });

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchRecipesAndProducts = async () => {
    setLoading(true);
    try {
      const [recRes, prodRes] = await Promise.all([
        fetch("/api/admin/recipes"),
        fetch("/api/admin/products"),
      ]);
      const recData = await recRes.json();
      const prodData = await prodRes.json();
      if (recData.success) setRecipes(recData.recipes || []);
      if (prodData.success) setProducts(prodData.products || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesAndProducts();
  }, []);

  const handleOpenModal = (recipe?: any) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        imageUrl: recipe.imageUrl || "",
        category: recipe.category || "healthy_cooking",
        prepTimeMinutes: String(recipe.prepTimeMinutes || "15"),
        servings: String(recipe.servings || "4"),
        difficulty: recipe.difficulty || "Easy",
        healthBenefits: recipe.healthBenefits || "",
        instructions: Array.isArray(recipe.instructions) && recipe.instructions.length > 0
          ? recipe.instructions
          : [{ stepNumber: 1, title: "ধাপ ১", description: "" }],
        linkedProductIds: Array.isArray(recipe.linkedProductIds) ? recipe.linkedProductIds : [],
        bundleDiscountPercent: String(recipe.bundleDiscountPercent || "5"),
        isFeatured: Boolean(recipe.isFeatured),
        isActive: recipe.isActive !== false,
      });
    } else {
      setEditingRecipe(null);
      setForm({
        id: null,
        title: "",
        slug: "",
        imageUrl: "",
        category: "healthy_cooking",
        prepTimeMinutes: "15",
        servings: "4",
        difficulty: "Easy",
        healthBenefits: "",
        instructions: [
          { stepNumber: 1, title: "উপাদান প্রস্তুতি", description: "" },
          { stepNumber: 2, title: "রান্না বা মিশ্রণ প্রণালী", description: "" },
        ],
        linkedProductIds: [],
        bundleDiscountPercent: "5",
        isFeatured: false,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleAddInstructionStep = () => {
    setForm((prev) => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        { stepNumber: prev.instructions.length + 1, title: `ধাপ ${prev.instructions.length + 1}`, description: "" },
      ],
    }));
  };

  const handleInstructionChange = (index: number, field: string, val: string) => {
    setForm((prev) => {
      const copy = [...prev.instructions];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, instructions: copy };
    });
  };

  const handleToggleProductLink = (prodId: number) => {
    setForm((prev) => {
      const exists = prev.linkedProductIds.includes(prodId);
      return {
        ...prev,
        linkedProductIds: exists
          ? prev.linkedProductIds.filter((id) => id !== prodId)
          : [...prev.linkedProductIds, prodId],
      };
    });
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Recipe Saved",
          message: data.message || "Recipe published successfully!",
          type: "success",
        });
        setModalOpen(false);
        fetchRecipesAndProducts();
      } else {
        setAlert({
          isOpen: true,
          title: "Save Failed",
          message: data.error || "Failed to save recipe",
          type: "error",
        });
      }
    } catch (err: any) {
      setAlert({ isOpen: true, title: "Error", message: err.message, type: "error" });
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/admin/recipes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAlert({ isOpen: true, title: "Deleted", message: data.message, type: "success" });
        fetchRecipesAndProducts();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4" />
            <span>Content Marketing & Cart Bundles</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Recipes, Cooking & Herbal Remedies
          </h2>
          <p className="text-xs text-ink-soft mt-0.5 max-w-2xl leading-relaxed">
            Create educational recipe guides and health remedy articles where visitors can add all required organic ingredients into their cart with a single click.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Recipe</span>
        </button>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-forest" />
            Loading recipes...
          </div>
        ) : recipes.length === 0 ? (
          <div className="col-span-full p-12 text-center text-stone-400 bg-white rounded-3xl border border-line">
            No recipes created yet. Click "Write New Recipe" to publish your first health remedy.
          </div>
        ) : (
          recipes.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-stone-100 relative overflow-hidden">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Utensils className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-forest text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    {r.category === "herbal_remedy" ? "🌿 ভেষজ যত্ন" : "🍳 রান্না রেসিপি"}
                  </div>
                  {r.isFeatured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="font-bold text-sm text-ink line-clamp-2">{r.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {r.healthBenefits || "প্রাকৃতিক স্বাস্থ্য উপকারিতা এবং ব্যবহার প্রণালী..."}
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-[11px] text-stone-400">
                    <span>⏱ {r.prepTimeMinutes} min</span>
                    <span>👥 {r.servings} Servings</span>
                    <span>🛒 {Array.isArray(r.linkedProductIds) ? r.linkedProductIds.length : 0} Products linked</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {r.isActive ? "PUBLISHED" : "DRAFT"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenModal(r)}
                    className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-stone-200 text-stone-700 transition-all cursor-pointer"
                    title="Edit Recipe"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(r.id)}
                    className="p-1.5 rounded-lg bg-white hover:bg-red-600 hover:text-white border border-stone-200 text-red-600 transition-all cursor-pointer"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recipe Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-line shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-ink">
                {editingRecipe ? "Edit Recipe / Health Remedy" : "Publish New Recipe"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Recipe Title</label>
                <input
                  type="text"
                  placeholder="e.g. খাঁটি মধু ও কালোজিরা তেলের ইমিউনিটি বুস্টার ড্রিংক"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  >
                    <option value="healthy_cooking">Healthy Cooking (স্বাস্থ্যকর রান্না)</option>
                    <option value="herbal_remedy">Herbal Remedy (ভেষজ যত্ন ও টোটকা)</option>
                    <option value="breakfast">Morning Energy (সকালের নাস্তা)</option>
                    <option value="drinks">Organic Drinks (অর্গানিক জুস ও ড্রিংকস)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={form.prepTimeMinutes}
                    onChange={(e) => setForm({ ...form, prepTimeMinutes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Servings</label>
                  <input
                    type="number"
                    value={form.servings}
                    onChange={(e) => setForm({ ...form, servings: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">1-Click Bundle Discount (%)</label>
                  <input
                    type="number"
                    value={form.bundleDiscountPercent}
                    onChange={(e) => setForm({ ...form, bundleDiscountPercent: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Health & Purity Benefits</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this recipe is beneficial for health..."
                  value={form.healthBenefits}
                  onChange={(e) => setForm({ ...form, healthBenefits: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white"
                />
              </div>

              {/* Link Store Products for 1-Click Cart */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Linked Products for 1-Click Cart ({form.linkedProductIds.length} Selected)</span>
                  <span className="text-[10px] text-forest font-semibold">Visitors can buy all in 1 click!</span>
                </label>
                <div className="max-h-36 overflow-y-auto border border-stone-200 rounded-xl p-2 space-y-1 bg-stone-50">
                  {products.map((p) => {
                    const isSelected = form.linkedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProductLink(p.id)}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? "bg-forest text-white font-bold" : "hover:bg-stone-200/60 text-stone-700"
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="text-[11px]">৳{p.discountPrice || p.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">Preparation Steps</label>
                  <button
                    type="button"
                    onClick={handleAddInstructionStep}
                    className="text-xs text-forest hover:text-forest-deep font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>
                {form.instructions.map((step, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <input
                      type="text"
                      placeholder={`Step ${idx + 1} Title (e.g. উপাদান মেশান)`}
                      value={step.title}
                      onChange={(e) => handleInstructionChange(idx, "title", e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Step details..."
                      value={step.description}
                      onChange={(e) => handleInstructionChange(idx, "description", e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest accent-forest"
                  />
                  <span className="text-xs font-bold text-stone-800">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest accent-forest"
                  />
                  <span className="text-xs font-bold text-stone-800">Publish Immediately</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Recipe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
