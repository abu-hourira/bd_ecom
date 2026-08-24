"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  RotateCcw,
  Loader2,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import { formatTaka } from "@/lib/utils";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCustomer(data.customer);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg text-ink">
        <AdminSidebar />
        <div className="flex-1 p-12 text-center text-ink-soft">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-forest mb-3" />
          <span>Loading customer profile...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen bg-bg text-ink">
        <AdminSidebar />
        <div className="flex-1 p-12 text-center text-ink-soft">
          <p>Customer not found.</p>
          <Link href="/admin/customers" className="text-forest underline mt-2 block">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-2 rounded-xl border border-line bg-paper text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">
              {customer.name}
            </h1>
            <p className="text-xs text-ink-soft mt-0.5">
              Customer ID #{customer.id} · Registered since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-paper p-5 rounded-2xl border border-line shadow-card space-y-1">
            <span className="text-xs text-ink-soft font-semibold">Total Lifetime Spend</span>
            <div className="text-2xl font-bold font-mono text-forest">
              {formatTaka(customer.lifetimeSpend || 0)}
            </div>
          </div>

          <div className="bg-paper p-5 rounded-2xl border border-line shadow-card space-y-1">
            <span className="text-xs text-ink-soft font-semibold">Total Orders Placed</span>
            <div className="text-2xl font-bold font-mono text-ink">
              {customer.orders?.length || 0}
            </div>
          </div>

          <div className="bg-paper p-5 rounded-2xl border border-line shadow-card space-y-1">
            <span className="text-xs text-ink-soft font-semibold">Primary Contact</span>
            <div className="text-sm font-bold text-ink truncate">
              {customer.phone || customer.email}
            </div>
            <div className="text-xs text-ink-soft truncate">{customer.city || "Dhaka"}</div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <h3 className="font-bold font-display text-lg text-ink">Order History</h3>
            <span className="text-xs font-mono font-semibold bg-bg px-2.5 py-1 rounded-full border border-line text-ink-soft">
              {customer.orders?.length || 0} Orders
            </span>
          </div>

          {customer.orders?.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink-soft">No orders placed yet.</div>
          ) : (
            <div className="divide-y divide-line">
              {customer.orders?.map((o: any) => (
                <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink text-sm">#{o.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg border border-line">
                        {o.orderStatus}
                      </span>
                    </div>
                    <div className="text-ink-soft text-[11px] mt-0.5">
                      Tracking: {o.trackingId} · {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-forest text-sm">
                      {formatTaka(o.totalAmount)}
                    </span>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="p-2 rounded-xl border border-line bg-bg hover:bg-forest hover:text-white transition-all text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses */}
        {customer.addresses?.length > 0 && (
          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
            <h3 className="font-bold font-display text-lg text-ink">Saved Delivery Addresses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.addresses.map((a: any) => (
                <div key={a.id} className="p-4 rounded-2xl bg-bg border border-line text-xs space-y-1">
                  <div className="font-bold text-ink">{a.title} {a.isDefault && "(Default)"}</div>
                  <div className="text-ink-soft">{a.recipientName} ({a.phone})</div>
                  <div className="text-ink leading-relaxed">{a.streetAddress}, {a.city}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
