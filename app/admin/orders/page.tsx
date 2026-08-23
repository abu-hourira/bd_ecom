// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Eye,
  RefreshCw,
  ExternalLink,
  MapPin,
  Phone,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import { OrderStatus } from "@prisma/client";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [courierPartner, setCourierPartner] = useState("");
  const [courierTrackingId, setCourierTrackingId] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (activeTab !== "ALL") query.set("status", activeTab);

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const json = await res.json();
      if (json.success) setOrders(json.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, search]);

  const openStatusModal = (order: any) => {
    setStatusModalOrder(order);
    setNewStatus(order.orderStatus);
    setCourierPartner(order.courierPartner || "Pathao");
    setCourierTrackingId(order.courierTrackingId || "");
    setStatusNote("");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${statusModalOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newStatus,
          courierPartner,
          courierTrackingId,
          statusNote,
          actorRole: "ADMIN",
          actorName: "Abu Hourira (Admin)",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Update failed");

      setStatusModalOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Packed", value: "PACKED" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-ink">Order Operations & Live Tracking</h2>
          <p className="text-sm text-ink-soft">
            Manage incoming orders, dispatch couriers, and update real-time tracking stages.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-paper text-ink-soft hover:text-ink hover:bg-bg transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === t.value
                ? "bg-forest text-white shadow-xs"
                : "bg-paper text-ink-soft hover:bg-bg hover:text-ink border border-line"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-card flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search by order #, tracking ID, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>

        <div className="text-xs text-ink-soft font-mono hidden sm:block">
          Showing {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="py-4 px-6">Order & Tracking</th>
                <th className="py-4 px-6">Customer Info</th>
                <th className="py-4 px-6">Status Stage</th>
                <th className="py-4 px-6">Courier / Shipping</th>
                <th className="py-4 px-6">Payment & Total</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-soft">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-bg/50 transition-colors">
                    {/* Order Number & Tracking Token */}
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-ink">{o.orderNumber}</div>
                      <div className="text-[11px] font-mono text-forest bg-forest-soft/70 px-2 py-0.5 rounded-md inline-block mt-1">
                        {o.trackingId}
                      </div>
                      <div className="text-[11px] text-ink-soft mt-1">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-ink">{o.customerName}</div>
                      <div className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{o.customerPhone}</span>
                      </div>
                      <div className="text-xs text-ink-muted truncate max-w-xs mt-0.5">
                        {o.shippingAddress}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={o.orderStatus} size="sm" />
                      {o.estimatedDelivery && (
                        <div className="text-[10px] text-ink-soft mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Est: {new Date(o.estimatedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Courier Partner */}
                    <td className="py-4 px-6">
                      {o.courierPartner ? (
                        <div>
                          <div className="font-semibold text-xs text-ink flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-forest" />
                            <span>{o.courierPartner}</span>
                          </div>
                          {o.courierTrackingId && (
                            <div className="text-[11px] font-mono text-ink-soft">
                              #{o.courierTrackingId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted italic">Not Assigned</span>
                      )}
                    </td>

                    {/* Total & Payment */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-ink text-sm">
                        {formatTaka(o.totalAmount)}
                      </div>
                      <div className="text-[11px] text-ink-soft flex items-center gap-1 mt-0.5">
                        <span className="uppercase font-semibold text-[10px] px-1.5 py-0.2 rounded bg-bg border border-line">
                          {o.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            o.paymentStatus === "PAID" ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          ({o.paymentStatus})
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStatusModal(o)}
                          className="px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-deep text-white text-xs font-semibold transition-colors shadow-xs"
                        >
                          Update Stage
                        </button>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="p-1.5 rounded-lg bg-bg hover:bg-paper text-ink-soft hover:text-ink border border-line transition-colors"
                          title="View Invoice & Timeline"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Status Switcher Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl border border-line shadow-floating max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-ink">
                  Update Tracking Stage
                </h3>
                <p className="text-xs font-mono text-ink-soft mt-0.5">
                  Order #{statusModalOrder.orderNumber} ({statusModalOrder.trackingId})
                </p>
              </div>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Select Next Status Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="PENDING">Pending (Initial Checkout)</option>
                  <option value="CONFIRMED">Confirmed (Customer Verified)</option>
                  <option value="PACKED">Packed (Sealed in Warehouse)</option>
                  <option value="SHIPPED">Shipped (Handed to Courier Partner)</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery (Rider on the Way)</option>
                  <option value="DELIVERED">Delivered (Successfully Received)</option>
                  <option value="CANCELLED">Cancelled (Voided/Refunded)</option>
                  <option value="RETURNED">Returned (Product Return)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Courier Partner</label>
                  <input
                    type="text"
                    placeholder="Pathao, Steadfast, RedX"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Courier Tracking ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PTH-884920"
                    value={courierTrackingId}
                    onChange={(e) => setCourierTrackingId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Audit Note / Reason (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified customer delivery address via phone call."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-line text-ink text-sm hover:bg-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Save & Sync Customer Tracking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
