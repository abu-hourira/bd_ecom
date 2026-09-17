"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
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
      <div className="p-10 text-center text-ink-soft bg-paper rounded-2xl border border-line">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
        <span className="text-xs">Loading customer profile...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-10 text-center text-ink-soft bg-paper rounded-2xl border border-line">
        <p className="text-xs">Customer not found.</p>
        <Link href="/admin/customers" className="text-forest underline mt-2 inline-block text-xs font-semibold">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2.5 bg-paper p-3 rounded-2xl border border-line shadow-card">
        <Link
          href="/admin/customers"
          className="p-1.5 rounded-lg border border-line bg-bg text-ink-soft hover:text-ink cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold font-display text-ink">
            {customer.name}
          </h1>
          <p className="text-[10px] text-ink-soft">
            Customer ID #{customer.id} · Registered since {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-paper p-3.5 rounded-2xl border border-line shadow-card space-y-1">
          <span className="text-[10px] text-ink-soft font-semibold uppercase">Total Lifetime Spend</span>
          <div className="text-xl font-bold font-mono text-forest">
            {formatTaka(customer.lifetimeSpend || 0)}
          </div>
        </div>

        <div className="bg-paper p-3.5 rounded-2xl border border-line shadow-card space-y-1">
          <span className="text-[10px] text-ink-soft font-semibold uppercase">Total Orders Placed</span>
          <div className="text-xl font-bold font-mono text-ink">
            {customer.orders?.length || 0}
          </div>
        </div>

        <div className="bg-paper p-3.5 rounded-2xl border border-line shadow-card space-y-1">
          <span className="text-[10px] text-ink-soft font-semibold uppercase">Primary Contact</span>
          <div className="text-xs font-bold text-ink truncate">
            {customer.phone || customer.email}
          </div>
          <div className="text-[10px] text-ink-soft truncate">{customer.city || "Dhaka"}</div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="p-3.5 border-b border-line flex items-center justify-between">
          <h3 className="font-bold font-display text-sm text-ink">Order History</h3>
          <span className="text-[10px] font-mono font-semibold bg-bg px-2 py-0.5 rounded-md border border-line text-ink-soft">
            {customer.orders?.length || 0} Orders
          </span>
        </div>

        {customer.orders?.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-soft">No orders placed yet.</div>
        ) : (
          <div className="divide-y divide-line">
            {customer.orders?.map((o: any) => (
              <div key={o.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink text-xs">#{o.orderNumber}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-bg border border-line">
                      {o.orderStatus}
                    </span>
                  </div>
                  <div className="text-ink-soft text-[10px] mt-0.5">
                    Tracking: {o.trackingId} · {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-forest text-xs">
                    {formatTaka(o.totalAmount)}
                  </span>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="p-1.5 rounded-lg border border-line bg-bg hover:bg-forest hover:text-white transition-all text-xs font-semibold cursor-pointer"
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
        <div className="bg-paper p-4 rounded-2xl border border-line shadow-card space-y-3">
          <h3 className="font-bold font-display text-sm text-ink">Saved Delivery Addresses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {customer.addresses.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-bg border border-line text-xs space-y-0.5">
                <div className="font-bold text-ink text-[11px]">{a.title} {a.isDefault && "(Default)"}</div>
                <div className="text-ink-soft text-[10px]">{a.recipientName} ({a.phone})</div>
                <div className="text-ink text-[11px] leading-relaxed">{a.streetAddress}, {a.city}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

