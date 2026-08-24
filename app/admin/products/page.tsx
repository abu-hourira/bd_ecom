"use client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/products/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Leaf,
  Layers,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; product: any | null }>({
    isOpen: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedCategory && selectedCategory !== "all") query.set("categoryId", selectedCategory);

      const res = await fetch(`/api/admin/products?${query.toString()}`);
      const json = await res.json();
      if (json.success) setProducts(json.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.categories);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const confirmDeleteProduct = async () => {
    if (!deleteModalState.product) return;
    const { id, name } = deleteModalState.product;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setDeleteModalState({ isOpen: false, product: null });
        setAlertState({
          isOpen: true,
          title: "Product Removed",
          message: `"${name}" was moved to the recycle bin.`,
          type: "success",
        });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-ink">Product Catalog</h2>
          <p className="text-sm text-ink-soft">
            Manage your certified organic food items, inventory stock, and pricing.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg border border-line text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6">Badge / Deal</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imageSrc =
                    Array.isArray(p.images) && p.images.length > 0
                      ? p.images[0]
                      : "/assets/products/placeholder.jpg";

                  const isLowStock = p.stockQuantity <= 10;
                  const isOutOfStock = p.stockQuantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-bg/50 transition-colors">
                      {/* Product Name + Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-bg border border-line shrink-0">
                            <Image
                              src={imageSrc}
                              alt={p.name}
                              fill
                              className="object-cover"
                              unoptimized={imageSrc.startsWith("/uploads/")}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-ink hover:text-forest transition-colors">
                              {p.name}
                            </div>
                            <div className="text-xs text-ink-soft flex items-center gap-2 mt-0.5">
                              <span>Unit: {p.unit}</span>
                              {p.organicCertified && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-forest font-medium">
                                  <Leaf className="w-3 h-3" />
                                  Organic
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-ink-soft text-xs">
                        {p.category?.name || "Uncategorized"}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-ink">{formatTaka(p.price)}</div>
                        {p.discountPrice && (
                          <div className="text-xs text-ink-muted line-through">
                            {formatTaka(p.discountPrice)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-6">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Low ({p.stockQuantity} {p.unit})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            {p.stockQuantity} {p.unit}
                          </span>
                        )}
                      </td>

                      {/* Badge / Deal */}
                      <td className="py-4 px-6">
                        {p.badge ? (
                          <span className="px-2.5 py-1 rounded-md bg-forest-soft text-forest text-xs font-bold">
                            {p.badge}
                          </span>
                        ) : p.isCombo ? (
                          <span className="px-2.5 py-1 rounded-md bg-accent-soft text-accent text-xs font-bold">
                            Combo Deal
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-2 rounded-lg bg-bg hover:bg-forest-soft text-ink-soft hover:text-forest transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModalState({ isOpen: true, product: p })}
                            className="p-2 rounded-lg bg-bg hover:bg-rose-50 text-ink-soft hover:text-rose-600 transition-colors"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, product: null })}
        onConfirm={confirmDeleteProduct}
        title="Move Product to Recycle Bin?"
        message={`Are you sure you want to remove "${deleteModalState.product?.name || ""}" from the active storefront catalog?\n\nThis will archive the item to the recycle bin with 1-click restore enabled.`}
        confirmText="Move to Recycle Bin"
        cancelText="Keep Product"
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
