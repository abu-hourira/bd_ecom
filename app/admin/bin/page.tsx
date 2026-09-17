"use client";
import { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  Package,
  Layers,
  TicketPercent,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCw,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export default function RecycleBinPage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, products: 0, categories: 0, promos: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);


  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchBinItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bin?type=" + activeTab);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinItems();
    setSelectedIds([]);
  }, [activeTab]);

  const filteredItems = items.filter((it) =>
    it.title?.toLowerCase().includes(search.toLowerCase()) ||
    it.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
    it.deletedBy?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((it) => it.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Restore
  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: `Restore ${selectedIds.length} Items?`,
      message: `Are you sure you want to restore ${selectedIds.length} selected items back to active status in your store?`,
      type: "info",
      confirmText: `Restore ${selectedIds.length} Items`,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/bin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "bulk_restore", ids: selectedIds }),
          });
          const json = await res.json();
          if (json.success) {
            setAlertState({
              isOpen: true,
              title: "Items Restored",
              message: json.message,
              type: "success",
            });
            setSelectedIds([]);
            fetchBinItems();
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  // Bulk Purge
  const handleBulkPurge = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: `Delete ${selectedIds.length} Items Permanently?`,
      message: `Warning: This will permanently delete ${selectedIds.length} selected items. This action CANNOT be undone.`,
      type: "danger",
      confirmText: "Delete Forever",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/bin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "bulk_purge", ids: selectedIds }),
          });
          const json = await res.json();
          if (json.success) {
            setAlertState({
              isOpen: true,
              title: "Permanently Deleted",
              message: json.message,
              type: "success",
            });
            setSelectedIds([]);
            fetchBinItems();
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  // Single Item Restore
  const handleRestore = (item: any) => {
    setConfirmState({
      isOpen: true,
      title: "Restore Item?",
      message: `Are you sure you want to restore "${item.title}" back to active catalog?`,
      type: "info",
      confirmText: "Restore Item",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/bin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "restore", id: item.id }),
          });
          const json = await res.json();
          if (json.success) {
            setAlertState({
              isOpen: true,
              title: "Item Restored",
              message: json.message,
              type: "success",
            });
            fetchBinItems();
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  // Single Item Purge
  const handlePurge = (item: any) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Permanently?",
      message: `Are you sure you want to permanently delete "${item.title}"? This action cannot be reversed.`,
      type: "danger",
      confirmText: "Delete Forever",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/bin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "purge", id: item.id }),
          });
          const json = await res.json();
          if (json.success) {
            setAlertState({
              isOpen: true,
              title: "Permanently Deleted",
              message: json.message,
              type: "success",
            });
            fetchBinItems();
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  // Empty entire bin
  const handleEmptyAll = () => {
    if (items.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: "Empty Entire Trash Bin?",
      message: `Warning: This will permanently delete all ${items.length} items in the Recycle Bin.`,
      type: "danger",
      confirmText: "Empty Entire Bin",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/bin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "empty_all" }),
          });
          const json = await res.json();
          if (json.success) {
            setAlertState({
              isOpen: true,
              title: "Bin Emptied",
              message: json.message,
              type: "success",
            });
            fetchBinItems();
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  const getIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t === "PRODUCT") return <Package className="w-5 h-5 text-amber-600" />;
    if (t === "CATEGORY") return <Layers className="w-5 h-5 text-emerald-600" />;
    if (t === "PROMO") return <TicketPercent className="w-5 h-5 text-purple-600" />;
    return <Trash2 className="w-5 h-5 text-stone-500" />;
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold font-display text-ink">
              Recycle Bin & Item Restore
            </h2>
          </div>
          <p className="text-xs text-ink-soft max-w-xl">
            Deleted products, categories, and promotions are held safely here. You can select multiple items to batch restore or permanently delete them.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={fetchBinItems}
            className="px-3 py-1.5 rounded-lg bg-bg hover:bg-stone-200 border border-line text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleEmptyAll}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty All</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-paper border border-line shadow-xs">
          <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block">Total Items in Bin</span>
          <span className="text-xl font-bold font-display text-ink mt-0.5 block">{stats.total}</span>
        </div>
        <div className="p-3 rounded-xl bg-paper border border-line shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Products in Trash</span>
          <span className="text-xl font-bold font-display text-amber-700 mt-0.5 block">{stats.products}</span>
        </div>
        <div className="p-3 rounded-xl bg-paper border border-line shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Categories in Trash</span>
          <span className="text-xl font-bold font-display text-emerald-700 mt-0.5 block">{stats.categories}</span>
        </div>
        <div className="p-3 rounded-xl bg-paper border border-line shadow-xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Promo Codes in Trash</span>
          <span className="text-xl font-bold font-display text-purple-700 mt-0.5 block">{stats.promos}</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-paper p-3 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: `All Items (${stats.total})` },
            { id: "PRODUCT", label: `Products (${stats.products})` },
            { id: "CATEGORY", label: `Categories (${stats.categories})` },
            { id: "PROMO", label: `Promo Codes (${stats.promos})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-forest text-white shadow-xs"
                  : "bg-bg text-ink-soft hover:text-ink hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg border border-line text-xs focus:outline-hidden"
          />
        </div>
      </div>

      {/* Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-forest-deep text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in sticky top-16 z-20 border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent text-forest-deep flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </div>
            <span className="text-xs font-semibold">
              {selectedIds.length} Items Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkRestore}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Selected</span>
            </button>

            <button
              type="button"
              onClick={handleBulkPurge}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      )}

      {/* Items List Table */}
      <div className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-soft">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
            <p className="text-xs">Loading deleted items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-ink-soft space-y-2">
            <div className="w-10 h-10 rounded-xl bg-forest-soft text-forest flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink font-display">Recycle Bin is Empty</h3>
            <p className="text-xs max-w-sm mx-auto">
              {search
                ? "No deleted items match your search term."
                : "No products or categories have been deleted. Your active store catalog is running cleanly."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg/60 border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="cursor-pointer text-ink-soft hover:text-ink"
                    >
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-forest" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Deleted Date</th>
                  <th className="py-2.5 px-3">Deleted By</th>
                  <th className="py-2.5 px-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-bg/50 transition-colors ${
                        isSelected ? "bg-forest-soft/30" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(item.id)}
                          className="cursor-pointer text-ink-soft hover:text-ink"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-forest" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0">
                            {getIcon(item.entityType)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-ink truncate block text-xs">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="text-[10px] text-ink-soft truncate block">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-bg border border-line text-ink-soft uppercase font-mono">
                          {item.entityType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-ink-soft text-[10px] font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-ink-soft text-[10px]">
                        {item.deletedBy || "Admin Staff"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestore(item)}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePurge(item)}
                            className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Purge</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type || "warning"}
        confirmText={confirmState.confirmText || "Confirm"}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

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
