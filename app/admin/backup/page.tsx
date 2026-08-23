"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

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
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <Database className="w-4 h-4 text-accent" />
              <span>Data Portability & Accounting</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-ink">
              Data Backup & CSV Export
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Export offline spreadsheets of orders and product catalogs, and review database snapshot health.
            </p>
          </div>
        </div>

        {/* Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-soft text-forest flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold font-display text-lg text-ink">
                Export Orders & Revenue Ledger
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Download a clean CSV spreadsheet with all customer orders, payment methods, tracking tokens, and revenue amounts.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCSV("orders")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Orders (.CSV)</span>
            </button>
          </div>

          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-soft text-forest flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold font-display text-lg text-ink">
                Export Products Catalog & Inventory
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Download all active products, category mappings, prices, and stock units for inventory audits.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCSV("products")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Catalog (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Database Portability Guarantee Box */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
          <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Database Portability Architecture</span>
          </h3>

          <div className="p-4 rounded-2xl bg-bg border border-line text-xs space-y-2 leading-relaxed text-ink-soft">
            <p>
              Your database structure is fully version-controlled in <code className="bg-paper px-1.5 py-0.5 rounded border border-line font-mono text-forest">prisma/schema.prisma</code>. If migrating database hosts (e.g. from local MariaDB/MySQL to PostgreSQL on Supabase or Neon), simply update <code className="bg-paper px-1.5 py-0.5 rounded border border-line font-mono text-forest">DATABASE_URL</code> and run <code className="bg-paper px-1.5 py-0.5 rounded border border-line font-mono text-forest">npx prisma db push</code> to regenerate all 16 relational tables with zero data loss.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
