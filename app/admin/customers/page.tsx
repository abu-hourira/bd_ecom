"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { formatTaka } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCustomers(data.customers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const totalRevenue = customers.reduce((sum, c) => sum + (c.lifetimeSpend || 0), 0);

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper p-4 rounded-2xl border border-line shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest uppercase tracking-wider mb-0.5">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span>Customer Relationship Management</span>
          </div>
          <h1 className="text-xl font-bold font-display text-ink">
            Registered Retail Customers
          </h1>
          <p className="text-xs text-ink-soft">
            Directory of shoppers, order history, repeat frequency, and customer lifetime value (LTV).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3 py-1.5 bg-bg rounded-xl border border-line flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-forest" />
            <div>
              <span className="text-[9px] text-ink-soft uppercase font-semibold block leading-tight">Total Customer LTV</span>
              <div className="text-xs font-bold font-mono text-forest">{formatTaka(totalRevenue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2.5 bg-paper p-2.5 rounded-xl border border-line shadow-xs">
        <Search className="w-4 h-4 text-ink-soft shrink-0 ml-1.5" />
        <input
          type="text"
          placeholder="Search by customer name, mobile phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-ink placeholder:text-ink-soft focus:outline-hidden"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="p-3.5 border-b border-line flex items-center justify-between">
          <h3 className="font-bold font-display text-sm text-ink">Customer Directory</h3>
          <span className="text-[11px] font-mono font-semibold bg-bg px-2 py-0.5 rounded-md border border-line text-ink-soft">
            {filtered.length} Customers
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-ink-soft">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-forest mb-2" />
            <span className="text-xs">Loading customer directory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-ink-soft">
            <Users className="w-8 h-8 mx-auto text-forest/40 mb-2" />
            <p className="text-xs font-semibold text-ink">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg/60 border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Orders</th>
                  <th className="py-2.5 px-3">Total Spend</th>
                  <th className="py-2.5 px-3">Joined</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-bg/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-ink text-xs">{c.name}</div>
                      <div className="text-[10px] text-ink-soft">{c.city || "Dhaka"}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-ink font-mono text-[11px]">{c.phone || "—"}</div>
                      <div className="text-[10px] text-ink-soft truncate max-w-[150px]">{c.email}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-forest-soft text-forest font-mono font-bold text-[10px]">
                        {c.totalOrders} Orders
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-forest text-xs">
                      {formatTaka(c.lifetimeSpend)}
                    </td>
                    <td className="py-2.5 px-3 text-ink-soft font-mono text-[10px]">
                      {new Date(c.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-bg hover:bg-forest hover:text-white transition-all text-[10px] font-semibold text-ink cursor-pointer"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

