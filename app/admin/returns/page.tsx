"use client";
// app/admin/returns/page.tsx

import { useEffect, useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  DollarSign,
  Package,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";
import { useLiveSync } from "@/lib/useLiveSync";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Action Modal State
  const [activeModal, setActiveModal] = useState<{
    returnItem: any;
    targetStatus: string;
    notes: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

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

  const fetchReturns = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/admin/returns");
      const json = await res.json();
      if (json.success) setReturns(json.returns || []);
    } catch (e) {
      console.error(e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns(false);
  }, []);

  // Real-time live sync polling every 5s for customer return submissions
  useLiveSync(() => fetchReturns(true), { interval: 5000 });

  const handleOpenStatusModal = (returnItem: any, targetStatus: string) => {
    setActiveModal({
      returnItem,
      targetStatus,
      notes: "",
    });
  };

  const handleExecuteStatusUpdate = async () => {
    if (!activeModal) return;

    setProcessing(true);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: activeModal.returnItem.id,
          status: activeModal.targetStatus,
          adminNotes: activeModal.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Update failed");

      setActiveModal(null);
      fetchReturns(true);
      setAlertState({
        isOpen: true,
        title: "Return Status Updated",
        message: `Successfully set return request status to ${activeModal.targetStatus}.`,
        type: "success",
      });
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Update Error",
        message: e.message || "Failed to update return status.",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Queue Active
            </span>
          </div>
          <h1 className="text-3xl font-bold font-display text-ink">
            Returns & Refund Requests
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Review customer return requests, inspect defect claims, and trigger refunds or replacement dispatches.
          </p>
        </div>
      </div>

      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <h3 className="font-bold font-display text-lg text-ink">Return Requests Queue</h3>
          <span className="text-xs font-mono font-semibold bg-bg px-2.5 py-1 rounded-full border border-line text-ink-soft">
            {returns.length} Requests
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-soft">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
            <span>Loading returns queue...</span>
          </div>
        ) : returns.length === 0 ? (
          <div className="p-12 text-center text-ink-soft space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600/40 mx-auto" />
            <p className="text-sm font-medium text-ink">No pending return requests</p>
            <p className="text-xs">Customer satisfaction is 100%.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {returns.map((r) => (
              <div key={r.id} className="p-6 space-y-4 hover:bg-bg/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-ink">
                      Tracking ID: {r.trackingId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase ${
                        r.status === "REQUESTED"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : r.status === "APPROVED" || r.status === "UNDER_REVIEW"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : r.status === "REFUNDED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <span className="text-xs text-ink-soft font-mono">
                    Order Total: {formatTaka(r.order?.totalAmount || 0)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-bg border border-line text-xs space-y-1.5">
                  <div className="font-semibold text-ink">Reason / Defect Description:</div>
                  <p className="text-ink-soft leading-relaxed">{r.reason}</p>
                  <div className="text-[11px] text-ink-soft font-mono pt-1">
                    Customer: {r.order?.customerName} ({r.order?.customerPhone})
                  </div>
                  {r.adminNotes && (
                    <div className="mt-2 pt-2 border-t border-line text-forest font-medium">
                      Admin Note: {r.adminNotes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {r.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(r, "UNDER_REVIEW")}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Mark Under Review
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(r, "APPROVED")}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Approve Return
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(r, "REJECTED")}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {r.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(r, "REFUNDED")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Process & Mark Refunded
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Status Custom Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold font-display text-lg text-ink">
                  Update Return Status
                </h3>
                <p className="text-xs text-ink-soft">
                  Setting status to <strong className="text-forest uppercase">{activeModal.targetStatus}</strong> for tracking {activeModal.returnItem.trackingId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink">
                Admin Notes / Message to Customer (Optional):
              </label>
              <textarea
                rows={3}
                value={activeModal.notes}
                onChange={(e) =>
                  setActiveModal((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                }
                placeholder="e.g. Return approved. Please pack item for pickup."
                className="w-full px-4 py-2.5 rounded-2xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={processing}
                className="px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusUpdate}
                disabled={processing}
                className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium flex items-center gap-1.5"
              >
                {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Status Update</span>
              </button>
            </div>
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
