"use client";
// app/admin/bin/page.tsx

import { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  Package,
  Layers,
  TicketPercent,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export default function RecycleBinPage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, products: 0, categories: 0, promos: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "danger" | "warning" | "info";
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
      const res = await fetch(`/api/admin/bin?type=${activeTab}`);
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
  }, [activeTab]);

  const handleRestore = (item: any) => {
    setConfirmState({
      isOpen: true,
      title: "Restore Item?",
      message: `Are you sure you want to restore "${item.title}" back to active status in the store?`,
      type: "info",
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
          } else {
            setAlertState({
              isOpen: true,
              title: "Restore Failed",
              message: json.error || "Could not restore item.",
              type: "error",
            });
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  const handlePurge = (item: any) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Permanently?",
      message: `Are you sure you want to permanently delete "${item.title}"? This action CANNOT be undone.`,
      type: "danger",
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
          } else {
            setAlertState({
              isOpen: true,
              title: "Delete Failed",
              message: json.error || "Could not delete item.",
              type: "error",
            });
          }
        } catch (e: any) {
          setAlertState({ isOpen: true, title: "Error", message: e.message, type: "error" });
        }
      },
    });
  };

  const handleEmptyAll = () => {
    if (items.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: "Empty Entire Trash Bin?",
      message: `Warning: This will permanently delete all ${items.length} items currently in the Recycle Bin. This action cannot be reversed.`,
      type: "danger",
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

  const filteredItems = items.filter((it) =>
    it.title?.toLowerCase().includes(search.toLowerCase()) ||
    it.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
    it.deletedBy?.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type: string) => {
    if (type === "PRODUCT") return <Package className="w-5 h-5 text-amber-600" />;
    if (type === "CATEGORY") return <Layers className="w-5 h-5 text-emerald-600" />;
    if (type === "PROMO") return <TicketPercent className="w-5 h-5 text-purple-600" />;
    return <Trash2 className="w-5 h-5 text-stone-500" />;
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader title="Recycle Bin (Trash)" onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Overview Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-700 font-bold text-lg font-display">
                <Trash2 className="w-5 h-5" />
                <span>Recycle Bin & Trash Manager</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Deleted products, categories, and promo codes are safely held here before permanent deletion. You can restore them anytime.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchBinItems}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh bin"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                disabled={items.length === 0}
                onClick={handleEmptyAll}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash Bin</span>
              </button>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total in Trash</span>
              <span className="text-2xl font-bold font-display text-stone-900 mt-1 block">{stats.total}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Products</span>
              <span className="text-2xl font-bold font-display text-amber-700 mt-1 block">{stats.products}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Categories</span>
              <span className="text-2xl font-bold font-display text-emerald-700 mt-1 block">{stats.categories}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Promo Codes</span>
              <span className="text-2xl font-bold font-display text-purple-700 mt-1 block">{stats.promos}</span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "ALL", label: "All Items" },
                { id: "PRODUCT", label: "Products" },
                { id: "CATEGORY", label: "Categories" },
                { id: "PROMO", label: "Promos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-forest text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deleted items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Deleted Items Table / List */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-stone-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-forest mx-auto" />
                <p className="text-xs">Loading trash bin items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 text-sm">Recycle Bin is Empty</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  No deleted items found. When you delete a product, category, or discount code, it will safely appear here for 30 days.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3.5 pl-5">Item Details</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Deleted By</th>
                      <th className="p-3.5">Deleted Date</th>
                      <th className="p-3.5 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                              {getIcon(item.entityType)}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block leading-snug">{item.title}</span>
                              {item.subtitle && (
                                <span className="text-[11px] text-stone-500 font-mono block mt-0.5">{item.subtitle}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                            {item.entityType}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                            <User className="w-3 h-3 text-stone-400" />
                            <span>{item.deletedBy || "Admin"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestore(item)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              title="Restore item back to active store"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePurge(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type || "warning"}
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
