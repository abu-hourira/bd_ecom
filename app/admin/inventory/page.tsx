import { useLiveSync } from "@/lib/useLiveSync";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/inventory/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchInventory = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => {
          if (!isBackground || prev.length === 0) return json.products;
          // Keep dirty edited values if in background sync
          return json.products.map((p: any) => {
            const existing = prev.find((x) => x.id === p.id);
            if (existing && existing._dirty) return existing;
            return p;
          });
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(false);
  }, []);

  // Real-time live inventory sync every 6 seconds
  useLiveSync(() => fetchInventory(true), { interval: 6000 });

  const handleStockChange = (id: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, Number(p.stockQuantity) + delta);
          return { ...p, stockQuantity: newQty, _dirty: true };
        }
        return p;
      })
    );
  };

  const handleStockInput = (id: number, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, stockQuantity: num, _dirty: true };
        }
        return p;
      })
    );
  };

  const handleSaveStock = async (product: any) => {
    setSavingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: product.stockQuantity }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, _dirty: false } : p))
      );
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Stock Update Error",
        message: err.message || "Failed to update stock.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stockQuantity <= 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Stock Sync Active
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">Inventory Stock Controller</h2>
          <p className="text-sm text-ink-soft">
            Real-time organic stock levels with quick restock increment buttons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{lowStockCount} Products Need Restock</span>
          </div>

          <button
            onClick={() => fetchInventory(false)}
            className="p-2.5 rounded-xl border border-line bg-paper text-ink-soft hover:text-ink hover:bg-bg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-card flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>

        <span className="text-xs font-mono text-ink-soft hidden sm:block">
          {products.length} Products Monitored
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Unit Price</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6">Quick Adjust</th>
                <th className="py-4 px-6 text-right">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= 10;
                  const isOut = p.stockQuantity === 0;
                  const imageSrc =
                    Array.isArray(p.images) && p.images.length > 0
                      ? p.images[0]
                      : "/assets/products/placeholder.jpg";

                  return (
                    <tr key={p.id} className="hover:bg-bg/50 transition-colors">
                      {/* Product */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-bg border border-line shrink-0">
                            <Image
                              src={imageSrc}
                              alt={p.name}
                              fill
                              className="object-cover"
                              unoptimized={imageSrc.startsWith("/uploads/")}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-ink text-sm">{p.name}</div>
                            <div className="text-xs text-ink-soft">Unit: {p.unit}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-xs text-ink-soft">
                        {p.category?.name || "General"}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-semibold text-ink">
                        {formatTaka(p.price)}
                      </td>

                      {/* Current Stock Input */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={p.stockQuantity}
                            onChange={(e) => handleStockInput(p.id, e.target.value)}
                            className={`w-20 px-3 py-1.5 rounded-xl border text-sm font-bold font-mono text-center focus:outline-none ${
                              isOut
                                ? "bg-rose-50 border-rose-300 text-rose-800"
                                : isLow
                                ? "bg-amber-50 border-amber-300 text-amber-800"
                                : "bg-bg border-line text-ink"
                            }`}
                          />
                          <span className="text-xs text-ink-soft font-mono">{p.unit}</span>
                        </div>
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockChange(p.id, -5)}
                            className="px-2 py-1 rounded-lg bg-bg hover:bg-rose-50 text-ink-soft hover:text-rose-600 border border-line text-xs font-mono font-semibold"
                            title="-5 units"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockChange(p.id, -1)}
                            className="px-2 py-1 rounded-lg bg-bg hover:bg-rose-50 text-ink-soft hover:text-rose-600 border border-line text-xs font-mono font-semibold"
                            title="-1 unit"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockChange(p.id, +1)}
                            className="px-2 py-1 rounded-lg bg-bg hover:bg-forest-soft text-ink-soft hover:text-forest border border-line text-xs font-mono font-semibold"
                            title="+1 unit"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockChange(p.id, +10)}
                            className="px-2 py-1 rounded-lg bg-bg hover:bg-forest-soft text-ink-soft hover:text-forest border border-line text-xs font-mono font-semibold"
                            title="+10 units"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockChange(p.id, +50)}
                            className="px-2 py-1 rounded-lg bg-bg hover:bg-forest-soft text-ink-soft hover:text-forest border border-line text-xs font-mono font-semibold"
                            title="+50 units"
                          >
                            +50
                          </button>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id || !p._dirty}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            p._dirty
                              ? "bg-forest hover:bg-forest-deep text-white shadow-xs"
                              : "bg-bg text-ink-muted cursor-default border border-line"
                          }`}
                        >
                          {savingId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{p._dirty ? "Save Stock" : "Synced"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
