"use client";
import { useLiveSync } from "@/lib/useLiveSync";
// app/admin/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  RefreshCw,
  Boxes,
  Truck,
  TicketPercent,
  Star,
  Users,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setData(json.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
  }, []);

  // Real-time live sync every 5 seconds for orders, revenue, and low stock alerts
  useLiveSync(() => fetchStats(true), { interval: 5000 });

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper p-3.5 sm:p-4 rounded-2xl border border-line shadow-card">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-ink truncate">
            Organic Farm Store Performance
          </h2>
          <p className="text-xs text-ink-soft truncate">
            Real-time sales revenue, inventory health, and live customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchStats(false)}
            className="p-2 rounded-lg border border-line hover:bg-bg text-ink-soft hover:text-ink transition-colors cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-deep text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <Link
          href="/admin/orders"
          className="p-2.5 rounded-xl bg-paper border border-line hover:border-forest/40 hover:bg-forest-soft/30 transition-all text-center flex flex-col items-center gap-1 shadow-xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-ink leading-tight">Orders</span>
          <span className="text-[9px] text-ink-soft">{data?.pendingOrders || 0} Pending</span>
        </Link>

        <Link
          href="/admin/products"
          className="p-2.5 rounded-xl bg-paper border border-line hover:border-forest/40 hover:bg-forest-soft/30 transition-all text-center flex flex-col items-center gap-1 shadow-xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-forest-soft text-forest flex items-center justify-center group-hover:scale-105 transition-transform">
            <Package className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-ink leading-tight">Products</span>
          <span className="text-[9px] text-ink-soft">{data?.totalProducts || 0} Items</span>
        </Link>

        <Link
          href="/admin/inventory"
          className="p-2.5 rounded-xl bg-paper border border-line hover:border-forest/40 hover:bg-forest-soft/30 transition-all text-center flex flex-col items-center gap-1 shadow-xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-ink leading-tight">Stock</span>
          <span className="text-[9px] text-amber-700 font-semibold">{data?.lowStockCount || 0} Low</span>
        </Link>

        <Link
          href="/admin/delivery"
          className="p-2.5 rounded-xl bg-paper border border-line hover:border-forest/40 hover:bg-forest-soft/30 transition-all text-center flex flex-col items-center gap-1 shadow-xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-ink leading-tight">Delivery</span>
          <span className="text-[9px] text-ink-soft">Fleet/Rider</span>
        </Link>

        <Link
          href="/admin/promos"
          className="p-2.5 rounded-xl bg-paper border border-line hover:border-forest/40 hover:bg-forest-soft/30 transition-all text-center flex flex-col items-center gap-1 shadow-xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TicketPercent className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-ink leading-tight">Coupons</span>
          <span className="text-[9px] text-ink-soft">Discounts</span>
        </Link>

        <Link
          href="/admin/customers"
          className="p-2.5 rounded-xl bg-paper border border-line hover:border-forest/40 hover:bg-forest-soft/30 transition-all text-center flex flex-col items-center gap-1 shadow-xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-ink leading-tight">Customers</span>
          <span className="text-[9px] text-ink-soft">CRM / LTV</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Revenue */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-paper border border-line shadow-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              Delivered Sales
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-ink">
              {loading ? "..." : formatTaka(data?.totalRevenue || 0)}
            </div>
            <p className="text-[10px] text-ink-soft mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Fulfilled orders</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-paper border border-line shadow-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-ink">
              {loading ? "..." : data?.totalOrders || 0}
            </div>
            <p className="text-[10px] text-ink-soft mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{data?.pendingOrders || 0} pending</span>
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-paper border border-line shadow-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              Active Catalog
            </span>
            <div className="w-7 h-7 rounded-lg bg-forest-soft text-forest flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-ink">
              {loading ? "..." : data?.totalProducts || 0}
            </div>
            <p className="text-[10px] text-ink-soft mt-0.5">100% Organic</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-paper border border-line shadow-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              Low Stock Alert
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-ink">
              {loading ? "..." : data?.lowStockCount || 0}
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 font-medium">Items with ≤ 10 units</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="p-3.5 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display text-ink">Recent Orders</h3>
              <p className="text-[11px] text-ink-soft">Live incoming customer purchases</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-deep"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg/60 text-ink-soft text-[10px] uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-ink-soft text-xs">
                      Loading orders...
                    </td>
                  </tr>
                ) : data?.recentOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-ink-soft text-xs">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  data?.recentOrders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-xs text-ink">
                        {order.orderNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-ink text-xs">{order.customerName}</div>
                        <div className="text-[10px] text-ink-soft font-mono">{order.customerPhone}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={order.orderStatus} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono text-ink text-xs">
                        {formatTaka(order.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-2 py-1 rounded-md bg-bg hover:bg-forest hover:text-white border border-line text-[10px] font-semibold text-forest transition-colors inline-block"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist (1 Column) */}
        <div className="bg-paper rounded-2xl border border-line shadow-card p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-display text-ink">Restock Alert</h3>
                <p className="text-[11px] text-ink-soft">Items needing restock</p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-semibold text-forest hover:underline"
              >
                Inventory
              </Link>
            </div>

            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-ink-soft text-center py-3">Checking inventory...</p>
              ) : data?.lowStockProducts?.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-ink">Stock is healthy</p>
                  <p className="text-[10px] text-ink-soft">All products have sufficient units</p>
                </div>
              ) : (
                data?.lowStockProducts?.slice(0, 5).map((prod: any) => (
                  <div
                    key={prod.id}
                    className="p-2 rounded-xl bg-bg border border-line flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-ink truncate">{prod.name}</div>
                      <div className="text-[10px] text-ink-soft">{formatTaka(prod.price)} / {prod.unit}</div>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                        {prod.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-line">
            <Link
              href="/admin/inventory"
              className="w-full py-2 rounded-lg bg-bg hover:bg-forest-soft text-forest text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Update Stock Levels</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

