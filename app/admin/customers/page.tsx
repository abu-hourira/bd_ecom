"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
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
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-accent" />
              <span>Customer Relationship Management</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-ink">
              Registered Retail Customers
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Directory of shoppers, order history, repeat frequency, and customer lifetime value (LTV).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-paper rounded-2xl border border-line flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-forest" />
              <div>
                <span className="text-[10px] text-ink-soft uppercase font-semibold">Total Customer LTV</span>
                <div className="text-sm font-bold font-mono text-forest">{formatTaka(totalRevenue)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-paper p-3 rounded-2xl border border-line shadow-xs">
          <Search className="w-4 h-4 text-ink-soft shrink-0 ml-2" />
          <input
            type="text"
            placeholder="Search by customer name, mobile phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-ink placeholder:text-ink-soft focus:outline-hidden"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <h3 className="font-bold font-display text-lg text-ink">Customer Database</h3>
            <span className="text-xs font-mono font-semibold bg-bg px-2.5 py-1 rounded-full border border-line text-ink-soft">
              {filtered.length} Customers
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-soft">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
              <span>Loading customer directory...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-ink-soft">
              <Users className="w-10 h-10 mx-auto text-forest/40 mb-2" />
              <p className="text-sm font-semibold text-ink">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Lifetime Spend</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-bg/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-ink text-xs">{c.name}</div>
                        <div className="text-[11px] text-ink-soft">{c.city || "Dhaka"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-ink font-mono">{c.phone || "—"}</div>
                        <div className="text-[11px] text-ink-soft">{c.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-forest-soft text-forest font-mono font-bold text-[11px]">
                          {c.totalOrders} Orders
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-forest text-xs">
                        {formatTaka(c.lifetimeSpend)}
                      </td>
                      <td className="p-4 text-ink-soft font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-line bg-bg hover:bg-forest hover:text-white transition-all text-[11px] font-semibold text-ink"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
