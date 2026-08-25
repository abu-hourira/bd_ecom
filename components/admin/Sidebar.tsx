"use client";
// components/admin/Sidebar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Trash2,
  Bike,
  Sliders,
  FileText,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  TicketPercent,
  Palette,
  ExternalLink,
  Bot,
  BellRing,
  KeyRound,
  Users,
  RotateCcw,
  Database,
  BarChart3,
  UserCheck,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("enmar_customer");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    localStorage.removeItem("enmar_customer");
    localStorage.removeItem("enmar_admin_email");
    router.replace("/auth/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Orders & Tracking", href: "/admin/orders", icon: ShoppingBag },
    { label: "Delivery Fleet", href: "/admin/delivery", icon: Bike },
    { label: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
    { label: "Inventory Stock", href: "/admin/inventory", icon: Boxes },
    { label: "Promo Codes", href: "/admin/promos", icon: TicketPercent },
    { label: "Staff & RBAC", href: "/admin/staff", icon: UserCheck },
    { label: "Ads & Promo Banners", href: "/admin/banners", icon: Sparkles },
    { label: "Site Content & Text", href: "/admin/content", icon: FileText },
    { label: "Feature Toggles", href: "/admin/features", icon: Sliders },
    { label: "Site Settings & Theme", href: "/admin/settings", icon: Palette },
    { label: "Recycle Bin", href: "/admin/bin", icon: Trash2 },
  ];

  const advancedItems = [
    { label: "Admin AI Agent", href: "/admin/ai", icon: Bot, badge: "AI" },
    { label: "Notifications", href: "/admin/notifications", icon: BellRing },
    { label: "API Access & Keys", href: "/admin/api-access", icon: KeyRound },
    { label: "API Import Sync", href: "/admin/api-import", icon: ExternalLink },
    { label: "Backup & Export", href: "/admin/backup", icon: Database },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-forest-deep text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-white/10",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent text-forest-deep font-bold flex items-center justify-center text-lg font-display">
              E
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-wide">ENMAR</span>
              <span className="block text-[10px] text-white/60 tracking-wider uppercase -mt-1 font-mono">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-white/70 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Store Management
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const currentPath = pathname || "";
                const isActive =
                  item.href === "/admin"
                    ? currentPath === "/admin"
                    : currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent text-forest-deep font-semibold shadow-md"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-forest-deep" : "text-white/60")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Automation & Tools
            </div>
            <nav className="space-y-1">
              {advancedItems.map((item) => {
                const Icon = item.icon;
                const currentPath = pathname || "";
                const isActive = currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent text-forest-deep font-semibold shadow-md"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-forest-deep" : "text-white/60")} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white/20 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Live Storefront
            </span>
            <span className="text-[10px] bg-forest px-1.5 py-0.5 rounded text-white/90">Preview</span>
          </Link>

          <div className="px-3 py-2.5 rounded-xl bg-black/20 flex items-center justify-between gap-2 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs border border-white/20 shrink-0 uppercase">
                {currentUser?.name ? currentUser.name.slice(0, 2) : "SA"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-white">
                  {currentUser?.name || "Superadmin"}
                </p>
                <p className="text-[10px] text-white/60 truncate">
                  {currentUser?.role?.replace("_", " ") || "SUPER ADMIN"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
