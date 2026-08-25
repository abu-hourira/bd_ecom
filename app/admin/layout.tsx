"use client";
// app/admin/layout.tsx - Secure Admin Layout Guard

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, ShieldAlert, Loader2, Lock } from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isStaff, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated || !isStaff) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}&error=unauthorized`);
    }
  }, [isLoaded, isAuthenticated, isStaff, pathname, router]);

  // Loading state — wait for auth to hydrate from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-forest" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-display text-stone-900">
              Verifying Security Access
            </h2>
            <p className="text-xs text-stone-500">
              Authenticating Staff & Superadmin credentials...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 text-forest text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Secure Vault Connecting</span>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!isAuthenticated || !isStaff) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-display text-stone-900">
              Access Restricted
            </h2>
            <p className="text-xs text-stone-500">
              You must sign in with an authorized Superadmin or Staff account to view this area.
            </p>
          </div>
          <button
            onClick={() => router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)}
            className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          onOpenMobile={() => setMobileOpen(true)}
          title="ENMAR Operations Suite"
          subtitle="Real-time Storefront & Order Management"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
