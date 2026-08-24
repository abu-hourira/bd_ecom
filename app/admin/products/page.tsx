"use client";
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
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [singleDeleteProduct, setSingleDeleteProduct] = useState<any | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
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

      const res = await fetch("/api/admin/products?" + query.toString());
      const json = await res.json();
      if (json.success) {
        setProducts(json.products || []);
      }
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
      if (json.success) setCategories(json.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    setSelectedIds([]);
  }, [search, selectedCategory]);

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const confirmSingleDelete = async () => {
    if (!singleDeleteProduct) return;
    const { id, name } = singleDeleteProduct;
    setDeleting(true);

    try {
      const res = await fetch("/api/admin/products/" + id, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
        setSingleDeleteProduct(null);
        setAlertState({
          isOpen: true,
          title: "Moved to Recycle Bin",
          message: `"${name}" was moved to the recycle bin. You can restore it anytime.`,
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

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setAlertState({
          isOpen: true,
          title: "Batch Deleted",
          message: json.message || `${selectedIds.length} products moved to Recycle Bin.`,
          type: "success",
        });
        setSelectedIds([]);
        setBulkDeleteModalOpen(false);
      } else {
        setAlertState({
          isOpen: true,
          title: "Bulk Delete Failed",
          message: json.error || "Could not delete selected products.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-ink">Product Catalog</h2>
          <p className="text-sm text-ink-soft">
            Manage your organic food products, inventory stock, and bulk product management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4 text-stone-500" />
            <span>Recycle Bin</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
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

      {/* Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-forest-deep text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-fadeIn sticky top-20 z-20 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent text-forest-deep flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </div>
            <span className="text-xs sm:text-sm font-semibold">
              {selectedIds.length} Products Selected
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="py-4 px-4 pl-5 w-10">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex items-center justify-center text-ink-soft hover:text-forest cursor-pointer"
                    title={selectedIds.length === products.length ? "Deselect All" : "Select All"}
                  >
                    {products.length > 0 && selectedIds.length === products.length ? (
                      <CheckSquare className="w-4 h-4 text-forest" />
                    ) : (
                      <Square className="w-4 h-4 text-ink-soft" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-4">Badge / Deal</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-soft space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-forest mx-auto" />
                    <p className="text-xs">Loading catalog...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-soft">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imageSrc =
                    Array.isArray(p.images) && p.images.length > 0
                      ? p.images[0]
                      : "/assets/products/placeholder.jpg";

                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.stockQuantity <= 10;
                  const isOutOfStock = p.stockQuantity === 0;

                  return (
                    <tr
                      key={p.id}
                      className={"transition-colors " + (isSelected ? "bg-forest/5 hover:bg-forest/10" : "hover:bg-bg/50")}
                    >
                      <td className="py-4 px-4 pl-5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(p.id)}
                          className="flex items-center justify-center cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-forest" />
                          ) : (
                            <Square className="w-4 h-4 text-ink-soft hover:text-stone-700" />
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4">
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
                              <span>Unit: {p.unit || "N/A"}</span>
                              {p.organicCertified && (
                                <span className="inline-flex items-center gap-0.5 text-forest font-medium text-[11px] bg-forest/10 px-1.5 py-0.5 rounded">
                                  <Leaf className="w-3 h-3" />
                                  Organic
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft bg-bg px-2.5 py-1 rounded-lg border border-line">
                          <Layers className="w-3 h-3 text-ink-soft" />
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          {p.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-forest">
                                {formatTaka(p.discountPrice)}
                              </span>
                              <span className="text-xs text-ink-soft line-through">
                                {formatTaka(p.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-ink">
                              {formatTaka(p.price)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Low Stock ({p.stockQuantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-forest bg-forest/10 px-2.5 py-1 rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" />
                              In Stock ({p.stockQuantity})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {p.badge ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-forest-deep border border-accent/40">
                            {p.badge}
                          </span>
                        ) : p.savingsPercentage ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                            Save {p.savingsPercentage}%
                          </span>
                        ) : (
                          <span className="text-xs text-ink-soft/40">—</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={"/admin/products/" + p.id}
                            className="p-2 rounded-xl text-ink-soft hover:text-forest hover:bg-forest/10 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSingleDeleteProduct(p)}
                            className="p-2 rounded-xl text-ink-soft hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* Single Product Delete Modal (Instant response, 0 safety delay lock) */}
      <ConfirmModal
        isOpen={!!singleDeleteProduct}
        title="Move to Recycle Bin?"
        message={`Are you sure you want to move "${singleDeleteProduct?.name || ""}" to the Recycle Bin? You can restore it anytime.`}
        confirmText="Move to Trash"
        type="warning"
        isLoading={deleting}
        onConfirm={confirmSingleDelete}
        onClose={() => setSingleDeleteProduct(null)}
      />

      {/* Bulk Delete Modal (Instant response, 0 safety delay lock) */}
      <ConfirmModal
        isOpen={bulkDeleteModalOpen}
        title={`Move ${selectedIds.length} Products to Recycle Bin?`}
        message={`Are you sure you want to move ${selectedIds.length} selected products to the Recycle Bin? They will be removed from the active storefront but can be restored anytime.`}
        confirmText={`Delete ${selectedIds.length} Products`}
        type="danger"
        isLoading={deleting}
        onConfirm={confirmBulkDelete}
        onClose={() => setBulkDeleteModalOpen(false)}
      />

      {/* Alert Notification Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type || "info"}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
