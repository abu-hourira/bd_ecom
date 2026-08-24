"use client";

import { useState, useEffect } from "react";
import {
  TicketPercent,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Save,
  X,
  Loader2,
  Power,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";
import AlertModal from "@/components/admin/AlertModal";

interface PromoCode {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  totalUsageCap: number | null;
  usageCount: number;
  perCustomerLimit: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [alertState, setAlertState] = useState<{
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

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    minOrderAmount: "500",
    maxDiscountAmount: "",
    totalUsageCap: "100",
    perCustomerLimit: "1",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promos");
      const data = await res.json();
      if (data.success) {
        setPromos(data.promos);
      }
    } catch (error) {
      console.error("Failed to load promo codes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      setTogglingId(promo.id);
      const newStatus = !promo.isActive;

      // Optimistic UI update
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: newStatus } : p))
      );

      const res = await fetch(`/api/admin/promos/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert on error
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, isActive: promo.isActive } : p))
        );
        setAlertState({
          isOpen: true,
          title: "Update Failed",
          message: data.error || "Failed to update promo status.",
          type: "error",
        });
      } else {
        setAlertState({
          isOpen: true,
          title: newStatus ? "Promo Activated" : "Promo Deactivated",
          message: `Promo code "${promo.code}" is now ${newStatus ? "ACTIVE" : "DEACTIVATED"}.`,
          type: newStatus ? "success" : "info",
        });
      }
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: error.message || "Something went wrong.",
        type: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
        setAlertState({
          isOpen: true,
          title: "Promo Deleted",
          message: `Promo code "${code}" has been deleted.`,
          type: "success",
        });
      }
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        title: "Delete Error",
        message: error.message || "Failed to delete promo code.",
        type: "error",
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setPromos([data.promo, ...promos]);
        setModalOpen(false);
        setFormData({
          code: "",
          discountType: "PERCENTAGE",
          discountValue: "10",
          minOrderAmount: "500",
          maxDiscountAmount: "",
          totalUsageCap: "100",
          perCustomerLimit: "1",
          startDate: "",
          endDate: "",
          isActive: true,
        });
        setAlertState({
          isOpen: true,
          title: "Promo Created",
          message: `Promo code "${data.promo.code}" published successfully!`,
          type: "success",
        });
      } else {
        setAlertState({
          isOpen: true,
          title: "Creation Error",
          message: data.error || "Failed to create promo code.",
          type: "error",
        });
      }
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        title: "Network Error",
        message: error.message || "Something went wrong.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight flex items-center gap-3">
            <TicketPercent className="w-8 h-8 text-forest" />
            <span>Discount & Promo Codes</span>
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Create, activate, deactivate, or manage marketing discount vouchers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Table List */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-bg/50 text-ink font-semibold">
                <th className="py-4 px-6">Promo Token</th>
                <th className="py-4 px-6">Discount</th>
                <th className="py-4 px-6">Min Order</th>
                <th className="py-4 px-6">Usage</th>
                <th className="py-4 px-6">Status / Toggle</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    Loading promo codes...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    No promo codes created yet. Click &quot;New Promo Code&quot; to create one.
                  </td>
                </tr>
              ) : (
                promos.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-bg/50 transition-colors ${!p.isActive ? "opacity-60 bg-gray-50/50" : ""}`}
                  >
                    {/* Code */}
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-soft border border-forest/20 text-forest font-mono font-bold text-sm tracking-wider">
                        <TicketPercent className="w-4 h-4" />
                        <span>{p.code}</span>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-ink">
                        {p.discountType === "PERCENTAGE"
                          ? `${p.discountValue}% OFF`
                          : p.discountType === "FREE_SHIPPING"
                          ? "Free Delivery"
                          : `৳${p.discountValue} OFF`}
                      </span>
                    </td>

                    {/* Min Order */}
                    <td className="py-4 px-6 font-mono text-ink-soft">
                      {formatTaka(p.minOrderAmount)}
                    </td>

                    {/* Usage Progress */}
                    <td className="py-4 px-6">
                      <div className="text-xs font-mono text-ink">
                        {p.usageCount} / {p.totalUsageCap || "∞"} used
                      </div>
                    </td>

                    {/* Status & Deactivate/Activate Toggle */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={togglingId === p.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                        }`}
                        title={p.isActive ? "Click to Deactivate" : "Click to Activate"}
                      >
                        {togglingId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : p.isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{p.isActive ? "Active (Enabled)" : "Deactivated"}</span>
                        <Power className="w-3 h-3 ml-1 opacity-60" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.code)}
                        className="p-2 text-ink-soft hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Promo Code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl border border-line shadow-floating max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-xl font-bold font-display text-ink">Create Promo Code</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Promo Code Token</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORGANIC20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FIXED">Fixed Amount (৳) Off</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    {formData.discountType === "PERCENTAGE" ? "Percentage (%)" : "Amount (৳)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="20"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Min Order Value (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Total Usage Cap</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalUsageCap}
                    onChange={(e) => setFormData({ ...formData, totalUsageCap: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-line text-ink text-sm hover:bg-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Publish Promo Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
