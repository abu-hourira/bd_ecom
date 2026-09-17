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
  RefreshCw,
} from "lucide-react";
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
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper p-4 rounded-2xl border border-line shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest uppercase tracking-wider mb-0.5">
            <BarChart3 className="w-3.5 h-3.5 text-accent" />
            <span>Business Intelligence & Performance</span>
          </div>
          <h1 className="text-xl font-bold font-display text-ink">
            Store Analytics & Reports
          </h1>
          <p className="text-xs text-ink-soft">
            Real-time revenue metrics, category sales volume, average order values, and conversion stats.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-bg rounded-xl border border-line shrink-0">
          {[
            { label: "7 Days", val: "7" },
            { label: "30 Days", val: "30" },
            { label: "90 Days", val: "90" },
            { label: "1 Year", val: "365" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setRange(tab.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                range === tab.val
                  ? "bg-forest text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => fetchAnalytics(range)}
            className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-stone-200 transition-colors ml-1 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-ink-soft bg-paper rounded-2xl border border-line">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
          <span className="text-xs">Computing analytics and revenue breakdown...</span>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-paper p-3.5 sm:p-4 rounded-2xl border border-line shadow-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-soft">Gross Revenue</span>
                <div className="w-7 h-7 rounded-lg bg-forest-soft text-forest flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-forest">
                {formatTaka(data?.totalRevenue || 0)}
              </div>
              <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>Organic sales</span>
              </div>
            </div>

            <div className="bg-paper p-3.5 sm:p-4 rounded-2xl border border-line shadow-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-soft">Total Orders</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-ink">
                {data?.totalOrders || 0}
              </div>
              <div className="text-[10px] text-ink-soft">Pathao & Steadfast</div>
            </div>

            <div className="bg-paper p-3.5 sm:p-4 rounded-2xl border border-line shadow-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-soft">Average Order (AOV)</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-ink">
                {formatTaka(data?.aov || 0)}
              </div>
              <div className="text-[10px] text-ink-soft">AOV per parcel</div>
            </div>

            <div className="bg-paper p-3.5 sm:p-4 rounded-2xl border border-line shadow-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-soft">Customer Base</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-ink">
                {data?.totalCustomers || 0}
              </div>
              <div className="text-[10px] text-ink-soft">Registered shoppers</div>
            </div>
          </div>

          {/* Revenue Trend Visual Bar Graph */}
          <div className="bg-paper p-4 sm:p-5 rounded-2xl border border-line shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold font-display text-sm sm:text-base text-ink">
                  Revenue Trajectory (Past {range} Days)
                </h3>
                <p className="text-[11px] text-ink-soft">
                  Daily sales aggregation with order volume
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-forest bg-forest-soft px-2 py-0.5 rounded-lg">
                Peak: {formatTaka(maxRevenue)}
              </span>
            </div>

            <div className="h-40 flex items-end gap-1 sm:gap-1.5 pt-4 overflow-x-auto">
              {data?.revenueTimeline?.map((item: any, idx: number) => {
                const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenue) * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[16px] flex flex-col items-center gap-1.5 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-9 hidden group-hover:flex flex-col items-center bg-forest-deep text-white text-[9px] py-1 px-2 rounded-md whitespace-nowrap z-20 shadow-md font-mono pointer-events-none">
                      <span>{item.date}</span>
                      <span className="font-bold">{formatTaka(item.revenue)} ({item.orders} orders)</span>
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all group-hover:brightness-110 ${
                        item.revenue > 0 ? "bg-forest" : "bg-line/40"
                      }`}
                    />
                    <span className="text-[8px] text-ink-soft font-mono truncate w-full text-center">
                      {idx % Math.ceil(data.revenueTimeline.length / 7) === 0 ? item.date : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column: Category Breakdown & Top Selling Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Category Sales Breakdown */}
            <div className="bg-paper p-4 rounded-2xl border border-line shadow-card space-y-3">
              <h3 className="font-bold font-display text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
                <Layers className="w-4 h-4 text-forest" />
                <span>Category Revenue Contribution</span>
              </h3>

              <div className="space-y-2.5">
                {data?.categorySales?.slice(0, 6).map((cat: any) => (
                  <div key={cat.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold text-ink text-[11px]">
                      <span>{cat.name}</span>
                      <span className="font-mono text-forest">
                        {formatTaka(cat.revenue)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-bg border border-line overflow-hidden">
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
            <div className="bg-paper p-4 rounded-2xl border border-line shadow-card space-y-3">
              <h3 className="font-bold font-display text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Top Performing Products</span>
              </h3>

              <div className="divide-y divide-line">
                {data?.topProducts?.map((p: any) => (
                  <div key={p.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate text-[11px]">{p.name}</p>
                      <p className="text-[10px] text-ink-soft">
                        {p.category} · Stock: {p.stock} units
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-forest text-[11px]">
                        {formatTaka(p.totalSales)}
                      </span>
                      <span className="block text-[9px] text-ink-soft font-mono">
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
    </div>
  );
}

