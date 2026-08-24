import AlertModal from "@/components/ui/AlertModal";
// app/admin/promos/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  TicketPercent,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Percent,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";

export default function AdminPromosPage() {
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "500",
    maxDiscountAmount: "",
    totalUsageCap: "100",
    perCustomerLimit: "1",
    startDate: "",
    endDate: "",
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      const json = await res.json();
      if (json.success) setPromos(json.promos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Create failed");

      setModalOpen(false);
      setFormData({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderAmount: "500",
        maxDiscountAmount: "",
        totalUsageCap: "100",
        perCustomerLimit: "1",
        startDate: "",
        endDate: "",
      });
      fetchPromos();
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Promo Code Error",
        message: err.message || "Failed to create promo code.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-ink">Promo Codes & Coupons</h2>
          <p className="text-sm text-ink-soft">
            Manage promotional campaign codes, discount percentages, and usage caps.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="py-4 px-6">Promo Code</th>
                <th className="py-4 px-6">Discount Type & Value</th>
                <th className="py-4 px-6">Min Order</th>
                <th className="py-4 px-6">Usage Progress</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-soft">
                    Loading promo codes...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-soft">
                    No promo codes created yet.
                  </td>
                </tr>
              ) : (
                promos.map((p) => (
                  <tr key={p.id} className="hover:bg-bg/50 transition-colors">
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

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </span>
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
