"use client";
import { useEffect, useState } from "react";
import {
  Database,
  FileSpreadsheet,
  ShieldCheck,
  Layers,
  ShoppingBag,
} from "lucide-react";

export default function AdminBackupPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/backup")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStats(json.stats);
      });
  }, []);

  const handleDownloadCSV = (type: "products" | "orders") => {
    window.open(`/api/admin/backup?type=${type}`, "_blank");
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper p-4 rounded-2xl border border-line shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest uppercase tracking-wider mb-0.5">
            <Database className="w-3.5 h-3.5 text-accent" />
            <span>Data Portability & Accounting</span>
          </div>
          <h1 className="text-xl font-bold font-display text-ink">
            Data Backup & CSV Export
          </h1>
          <p className="text-xs text-ink-soft">
            Export offline spreadsheets of orders and product catalogs, and review database snapshot health.
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-paper p-4 rounded-2xl border border-line shadow-card space-y-3">
          <div className="w-9 h-9 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold font-display text-sm text-ink">
              Export Orders & Revenue Ledger
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Download a clean CSV spreadsheet with all customer orders, payment methods, tracking tokens, and revenue amounts.
            </p>
          </div>
          <button
            onClick={() => handleDownloadCSV("orders")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Orders (.CSV)</span>
          </button>
        </div>

        <div className="bg-paper p-4 rounded-2xl border border-line shadow-card space-y-3">
          <div className="w-9 h-9 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold font-display text-sm text-ink">
              Export Products Catalog & Inventory
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Download all active products, category mappings, prices, and stock units for inventory audits.
            </p>
          </div>
          <button
            onClick={() => handleDownloadCSV("products")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Catalog (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Database Portability Guarantee Box */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-card space-y-2.5">
        <h3 className="font-bold font-display text-sm text-ink flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Database Portability Architecture</span>
        </h3>

        <div className="p-3 rounded-xl bg-bg border border-line text-xs space-y-1.5 leading-relaxed text-ink-soft">
          <p>
            Your database structure is fully version-controlled in <code className="bg-paper px-1.5 py-0.5 rounded border border-line font-mono text-forest">prisma/schema.prisma</code>. If migrating database hosts (e.g. from local SQLite to PostgreSQL on Supabase or Neon), simply update <code className="bg-paper px-1.5 py-0.5 rounded border border-line font-mono text-forest">DATABASE_URL</code> and run <code className="bg-paper px-1.5 py-0.5 rounded border border-line font-mono text-forest">npx prisma db push</code> to regenerate all relational tables with zero data loss.
          </p>
        </div>
      </div>
    </div>
  );
}

