"use client";

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
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import { formatTaka } from "@/lib/utils";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      const res = await fetch("/api/admin/returns");
      const json = await res.json();
      if (json.success) setReturns(json.returns || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (returnId: number, status: string) => {
    const adminNotes = prompt(`Enter optional note for setting status to ${status}:`) || "";
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId, status, adminNotes }),
      });
      const json = await res.json();
      if (json.success) fetchReturns();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <RotateCcw className="w-4 h-4 text-accent" />
              <span>Customer Satisfaction & Refunds</span>
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
              <span>Loading returns...</span>
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
                <div key={r.id} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-ink">
                        Tracking: {r.trackingId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                          r.status === "REQUESTED"
                            ? "bg-amber-100 text-amber-800"
                            : r.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : r.status === "REFUNDED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <span className="text-xs text-ink-soft font-mono">
                      Order Total: {formatTaka(r.order?.totalAmount || 0)}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-bg border border-line text-xs space-y-1">
                    <div className="font-semibold text-ink">Reason / Defect Description:</div>
                    <p className="text-ink-soft leading-relaxed">{r.reason}</p>
                    <div className="text-[11px] text-ink-soft font-mono pt-1">
                      Customer: {r.order?.customerName} ({r.order?.customerPhone})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {r.status === "REQUESTED" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "UNDER_REVIEW")}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
                        >
                          Mark Under Review
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                        >
                          Approve Return
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {r.status === "APPROVED" && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, "REFUNDED")}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        Process Refund Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
