"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Navigation,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Radio,
  LogOut,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useDeliveryGeolocation } from "@/lib/useDeliveryGeolocation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";
import { useLiveSync } from "@/lib/useLiveSync";

interface DeliveryItem {
  id: number;
  productName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
}

interface AssignedOrder {
  id: number;
  orderNumber: string;
  trackingId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryZone: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  items: DeliveryItem[];
  createdAt: string;
}

interface RiderInfo {
  id: number;
  name: string;
  phone: string;
  vehicleType: string;
}

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const [rider, setRider] = useState<RiderInfo | null>(null);
  const [activeOrders, setActiveOrders] = useState<AssignedOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed">("active");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    type: "danger" | "warning" | "info" | "success";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    type: "info",
    action: async () => {},
  });

  const [alertModal, setAlertModal] = useState<{
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

  // Geolocation hook
  const {
    isSharing,
    latitude,
    longitude,
    error: geoError,
    lastUpdated,
    permissionStatus,
    toggleLocationSharing,
  } = useDeliveryGeolocation(activeOrders.length);

  const fetchDriverData = async () => {
    try {
      const [authRes, ordersRes] = await Promise.all([
        fetch("/api/delivery/auth", { cache: "no-store" }),
        fetch("/api/delivery/orders", { cache: "no-store" }),
      ]);

      const authData = await authRes.json();
      if (!authData.authenticated) {
        router.replace("/delivery/login");
        return;
      }
      setRider(authData.rider);

      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setActiveOrders(ordersData.activeOrders || []);
        setCompletedOrders(ordersData.completedOrders || []);
      }
    } catch (e) {
      console.error("Failed to load driver orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  // Poll driver updates silently every 5 seconds
  useLiveSync(fetchDriverData, { interval: 5000 });

  const handleLogout = async () => {
    toggleLocationSharing(false);
    await fetch("/api/delivery/auth", { method: "DELETE" });
    router.replace("/delivery/login");
  };

  const handleUpdateStatus = (order: AssignedOrder, nextStatus: string) => {
    const isDelivering = nextStatus === "DELIVERED";

    setConfirmModal({
      isOpen: true,
      title: isDelivering
        ? `Mark Order ${order.orderNumber} as DELIVERED?`
        : `Update Status to ${nextStatus.replace(/_/g, " ")}?`,
      message: isDelivering
        ? order.paymentMethod === "COD"
          ? `Confirm that you have handed the parcel to ${order.customerName} and collected ৳${Number(order.totalAmount).toLocaleString()} in cash.`
          : `Confirm that parcel has been safely handed to ${order.customerName}.`
        : `This will notify customer ${order.customerName} via SMS and Email.`,
      confirmText: isDelivering ? "Confirm Delivery & Handover" : "Update Status",
      type: "info",
      action: async () => {
        try {
          const res = await fetch("/api/delivery/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              orderStatus: nextStatus,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Failed to update order");
          }

          if (nextStatus === "OUT_FOR_DELIVERY" && !isSharing) {
            toggleLocationSharing(true);
          }

          setAlertModal({
            isOpen: true,
            title: isDelivering ? "Delivery Completed" : "Status Updated",
            message: isDelivering
              ? `Order ${order.orderNumber} successfully marked as delivered.`
              : `Order ${order.orderNumber} is now marked as ${nextStatus.replace(/_/g, " ")}.`,
            type: "success",
          });

          fetchDriverData();
        } catch (err: any) {
          setAlertModal({
            isOpen: true,
            title: "Update Error",
            message: err.message || "Failed to update status",
            type: "error",
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-forest border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-ink">Loading delivery route...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink flex flex-col pb-12 antialiased">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-forest-deep text-paper px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-paper/10 border border-white/20 flex items-center justify-center">
            <Bike className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">{rider?.name || "Delivery Driver"}</div>
            <div className="text-[11px] text-white/70 flex items-center gap-1">
              <span>{rider?.phone}</span>
              <span>•</span>
              <span>{rider?.vehicleType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDriverData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white/80"
            title="Refresh Deliveries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 transition text-white/80"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {/* Location Sharing Controller Card */}
        <div
          className={`p-4 rounded-3xl border transition shadow-sm ${
            isSharing
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
              : "bg-paper border-line text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isSharing
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                <Radio className={`w-5 h-5 ${isSharing ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Live GPS Broadcasting
                </div>
                <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  {isSharing ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-700">Location Sharing Active</span>
                    </>
                  ) : (
                    <span className="text-stone-600">Location Sharing Inactive</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleLocationSharing()}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm ${
                isSharing
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-forest hover:bg-forest-deep text-white"
              }`}
            >
              {isSharing ? "Turn Off" : "Start Sharing"}
            </button>
          </div>

          {/* GPS Meta Info */}
          {isSharing && lastUpdated && (
            <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>
                  {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Last ping: {new Date(lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {/* Error / Permission Advisory */}
          {geoError && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Deliveries Navigation Tabs */}
        <div className="flex rounded-2xl bg-paper p-1 border border-line shadow-card">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              tab === "active"
                ? "bg-forest text-paper shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Active Deliveries ({activeOrders.length})</span>
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              tab === "completed"
                ? "bg-forest text-paper shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({completedOrders.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === "active" ? (
          activeOrders.length === 0 ? (
            <div className="bg-paper rounded-3xl p-8 border border-line text-center space-y-2 shadow-card">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="text-base font-bold text-ink">All Deliveries Clear!</div>
              <p className="text-xs text-ink-soft">
                You have no active orders in your route right now. New assignments will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const isOut = order.orderStatus === "OUT_FOR_DELIVERY";
                const isCod = order.paymentMethod === "COD";

                return (
                  <div
                    key={order.id}
                    className="bg-paper rounded-3xl p-5 border border-line shadow-card space-y-4 transition hover:border-forest/30"
                  >
                    {/* Top Row: Order ID & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-forest">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          Tracking: {order.trackingId}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isOut
                            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            : "bg-forest-soft text-forest border-forest/20"
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Customer Contact & Destination */}
                    <div className="bg-bg p-3.5 rounded-2xl border border-line/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-ink">
                          {order.customerName}
                        </div>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-paper text-xs font-bold shadow-sm active:scale-95 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>

                      <div className="text-xs text-ink-soft flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-earth shrink-0 mt-0.5" />
                        <div>
                          <div>{order.shippingAddress}</div>
                          <div className="text-[11px] font-semibold text-earth mt-0.5">
                            Zone: {order.deliveryZone || "Inside Dhaka"}
                          </div>
                        </div>
                      </div>

                      {/* 1-tap Directions Link */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          order.shippingAddress
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-deep transition pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Directions in Maps</span>
                      </a>
                    </div>

                    {/* Items & Cash Collection */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-ink-muted">
                        Package Contents ({order.items.length} items):
                      </div>
                      <div className="divide-y divide-line/40 text-xs">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="py-1.5 flex items-center justify-between"
                          >
                            <span className="font-medium text-ink">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-mono text-ink-soft">
                              ৳{Number(item.totalPrice).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div
                      className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
                        isCod
                          ? "bg-amber-50 text-amber-900 border border-amber-200"
                          : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {isCod ? "CASH TO COLLECT (COD):" : "PRE-PAID ONLINE:"}
                        </span>
                      </div>
                      <span className="text-sm font-mono">
                        ৳{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>

                    {/* Rider Action Buttons */}
                    <div className="pt-2">
                      {!isOut ? (
                        <button
                          onClick={() => handleUpdateStatus(order, "OUT_FOR_DELIVERY")}
                          className="w-full py-3 rounded-2xl bg-forest hover:bg-forest-deep text-paper font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99]"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Start Delivery (Out for Delivery)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(order, "DELIVERED")}
                          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Complete & Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Completed Orders Tab */
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="bg-paper rounded-3xl p-8 border border-line text-center text-xs text-ink-muted">
                No completed deliveries yet for this session.
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-paper rounded-2xl p-4 border border-line shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-ink">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-ink-soft mt-0.5">
                      {order.customerName} • ৳{Number(order.totalAmount).toLocaleString()}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Delivered
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Confirmation & Alert Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
