"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  ArrowUpRight,
  PieChart,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import { formatTaka } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = (days: string) => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${days}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.analytics);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const maxRevenue = data?.revenueTimeline?.reduce(
    (max: number, d: any) => (d.revenue > max ? d.revenue : max),
    1
  ) || 1;

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span>Business Intelligence & Performance</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-ink">
              Store Analytics & Reports
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Real-time revenue metrics, category sales volume, average order values, and conversion stats.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-paper rounded-2xl border border-line shadow-xs">
            {[
              { label: "7 Days", val: "7" },
              { label: "30 Days", val: "30" },
              { label: "90 Days", val: "90" },
              { label: "1 Year", val: "365" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setRange(tab.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  range === tab.val
                    ? "bg-forest text-white shadow-xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-ink-soft">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-forest mb-3" />
            <span>Computing analytics and revenue breakdown...</span>
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">Gross Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-forest">
                  {formatTaka(data?.totalRevenue || 0)}
                </div>
                <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Organic food sales</span>
                </div>
              </div>

              <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">Total Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-ink">
                  {data?.totalOrders || 0}
                </div>
                <div className="text-[11px] text-ink-soft">Fulfilled via Pathao & Steadfast</div>
              </div>

              <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">Average Order Value</span>
                  <div className="w-8 h-8 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-ink">
                  {formatTaka(data?.aov || 0)}
                </div>
                <div className="text-[11px] text-ink-soft">AOV per parcel</div>
              </div>

              <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">Customer Base</span>
                  <div className="w-8 h-8 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-ink">
                  {data?.totalCustomers || 0}
                </div>
                <div className="text-[11px] text-ink-soft">Registered shoppers</div>
              </div>
            </div>

            {/* Revenue Trend Visual Bar Graph */}
            <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-bold font-display text-lg text-ink">
                    Revenue Trajectory (Past {range} Days)
                  </h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Daily sales aggregation with order volume
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-forest">
                  Peak: {formatTaka(maxRevenue)}
                </span>
              </div>

              <div className="h-48 flex items-end gap-1 sm:gap-2 pt-6 overflow-x-auto">
                {data?.revenueTimeline?.map((item: any, idx: number) => {
                  const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenue) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[20px] flex flex-col items-center gap-2 group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-forest-deep text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap z-20 shadow-lg font-mono">
                        <span>{item.date}</span>
                        <span className="font-bold">{formatTaka(item.revenue)} ({item.orders} orders)</span>
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all group-hover:brightness-110 ${
                          item.revenue > 0 ? "bg-forest" : "bg-line/40"
                        }`}
                      />
                      <span className="text-[9px] text-ink-soft font-mono truncate w-full text-center">
                        {idx % Math.ceil(data.revenueTimeline.length / 7) === 0 ? item.date : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Column: Category Breakdown & Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Category Sales Breakdown */}
              <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
                <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2 border-b border-line pb-3">
                  <Layers className="w-5 h-5 text-forest" />
                  <span>Category Revenue Contribution</span>
                </h3>

                <div className="space-y-4">
                  {data?.categorySales?.slice(0, 6).map((cat: any) => (
                    <div key={cat.id} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-semibold text-ink">
                        <span>{cat.name}</span>
                        <span className="font-mono text-forest">
                          {formatTaka(cat.revenue)} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-bg border border-line overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className="h-full bg-forest rounded-full transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
                <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2 border-b border-line pb-3">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span>Top Performing Products</span>
                </h3>

                <div className="divide-y divide-line">
                  {data?.topProducts?.map((p: any) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-ink truncate">{p.name}</p>
                        <p className="text-[11px] text-ink-soft">
                          {p.category} · Stock: {p.stock} units
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-forest">
                          {formatTaka(p.totalSales)}
                        </span>
                        <span className="block text-[10px] text-ink-soft font-mono">
                          {p.unitsSold} sold
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
