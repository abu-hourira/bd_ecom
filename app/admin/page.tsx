// app/admin/page.tsx
"use client";

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
} from "lucide-react";
import { formatTaka } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
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
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-card">
        <div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Organic Farm Store Performance
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Real-time sales revenue, inventory health, and live customer orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl border border-line hover:bg-bg text-ink-soft hover:text-ink transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-medium text-sm shadow-premium transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-paper border border-line shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Delivered Sales
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-display text-ink">
              {loading ? "..." : formatTaka(data?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fulfilled customer orders</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-paper border border-line shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-display text-ink">
              {loading ? "..." : data?.totalOrders || 0}
            </div>
            <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{data?.pendingOrders || 0} pending processing</span>
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-6 rounded-3xl bg-paper border border-line shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Active Catalog
            </span>
            <div className="w-10 h-10 rounded-2xl bg-forest-soft text-forest flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-display text-ink">
              {loading ? "..." : data?.totalProducts || 0}
            </div>
            <p className="text-xs text-ink-soft mt-1">100% Certified Organic Food</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-paper border border-line shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Low Stock Alert
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-display text-ink">
              {loading ? "..." : data?.lowStockCount || 0}
            </div>
            <p className="text-xs text-amber-700 mt-1 font-medium">Items with ≤ 10 units</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-display text-ink">Recent Orders</h3>
              <p className="text-xs text-ink-soft">Live incoming customer purchases</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-deep"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="py-3 px-6">Order #</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      Loading orders...
                    </td>
                  </tr>
                ) : data?.recentOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  data?.recentOrders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-xs text-ink">
                        {order.orderNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-ink">{order.customerName}</div>
                        <div className="text-xs text-ink-soft">{order.customerPhone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={order.orderStatus} size="sm" />
                      </td>
                      <td className="py-4 px-6 font-semibold text-ink">
                        {formatTaka(order.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs font-semibold text-forest hover:underline"
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
        <div className="bg-paper rounded-3xl border border-line shadow-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">Restock Alert</h3>
                <p className="text-xs text-ink-soft">Items needing restock</p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-semibold text-forest hover:underline"
              >
                Inventory
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-ink-soft text-center py-4">Checking inventory...</p>
              ) : data?.lowStockProducts?.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-ink">Stock is healthy</p>
                  <p className="text-xs text-ink-soft">All products have sufficient units</p>
                </div>
              ) : (
                data?.lowStockProducts?.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-bg border border-line flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-ink">{prod.name}</div>
                      <div className="text-[11px] text-ink-soft">{formatTaka(prod.price)} / {prod.unit}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                        {prod.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-line mt-6">
            <Link
              href="/admin/inventory"
              className="w-full py-2.5 rounded-xl bg-bg hover:bg-forest-soft text-forest text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Update Stock Levels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
