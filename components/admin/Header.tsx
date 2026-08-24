"use client";
// components/admin/Header.tsx

import { Menu, Search, ShieldCheck, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenMobile: () => void;
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ onOpenMobile, title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 px-4 sm:px-8 bg-paper border-b border-line flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-bg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-display text-ink tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-ink-soft hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-soft text-forest text-xs font-medium border border-forest/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Superadmin Access</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg border border-line text-xs text-ink-soft font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>v1.0 (Next.js 15)</span>
        </div>
      </div>
    </header>
  );
}
