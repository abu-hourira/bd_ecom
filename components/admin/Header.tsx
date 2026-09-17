"use client";
// components/admin/Header.tsx

import Link from "next/link";
import { Menu, ShieldCheck, Sparkles, ExternalLink, Plus, Bell } from "lucide-react";

interface HeaderProps {
  onOpenMobile: () => void;
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ onOpenMobile, title, subtitle }: HeaderProps) {
  return (
    <header className="h-13 sm:h-14 px-3 sm:px-6 bg-paper border-b border-line flex items-center justify-between sticky top-0 z-30 shadow-xs backdrop-blur-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenMobile}
          className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg lg:hidden cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold font-display text-ink tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-ink-soft hidden md:block truncate -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          href="/admin/products/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-deep text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg hover:bg-stone-200 border border-line text-[11px] font-medium text-ink-soft hover:text-ink transition-colors"
          title="Open live storefront in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Storefront</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-soft text-forest text-[11px] font-medium border border-forest/10">
          <ShieldCheck className="w-3 h-3" />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}

