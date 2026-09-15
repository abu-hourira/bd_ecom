"use client";
// app/admin/loyalty/page.tsx
import { useEffect, useState } from "react";
import {
  Coins,
  Gift,
  Award,
  Users,
  Settings2,
  Save,
  PlusCircle,
  Search,
  CheckCircle2,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminLoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    earnRate: "1",
    redeemValue: "1",
    minRedeem: "50",
    welcomeBonus: "50",
    isActive: true,
  });

  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/loyalty");
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_SETTINGS", settings }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Settings Saved",
          message: data.message || "Loyalty coin rules updated successfully!",
          type: "success",
        });
      } else {
        setAlert({
          isOpen: true,
          title: "Save Failed",
          message: data.error || "Failed to save settings",
          type: "error",
        });
      }
    } catch (err: any) {
      setAlert({
        isOpen: true,
        title: "Error",
        message: err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;

    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADJUST_COINS",
          userId: selectedUser.userId,
          amount: adjustAmount,
          description: adjustReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Coins Adjusted",
          message: `Successfully adjusted ${adjustAmount} coins for ${selectedUser.user?.name || "Customer"}.`,
          type: "success",
        });
        setAdjustModal(false);
        setAdjustAmount("");
        setAdjustReason("");
        fetchLoyaltyData();
      } else {
        setAlert({
          isOpen: true,
          title: "Adjustment Failed",
          message: data.error || "Could not adjust coins",
          type: "error",
        });
      }
    } catch (err: any) {
      setAlert({
        isOpen: true,
        title: "Error",
        message: err.message,
        type: "error",
      });
    }
  };

  const filteredWallets = wallets.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      w.user?.name?.toLowerCase().includes(q) ||
      w.user?.email?.toLowerCase().includes(q) ||
      w.user?.phone?.includes(q)
    );
  });

  const totalCirculatingCoins = wallets.reduce((sum, w) => sum + (w.coinsBalance || 0), 0);
  const totalCoinsEarned = wallets.reduce((sum, w) => sum + (w.totalEarned || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>Customer Retention & Growth</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Enmar Coins & Loyalty Rewards
          </h2>
          <p className="text-xs text-ink-soft mt-0.5 max-w-2xl leading-relaxed">
            Configure how customers earn cashback coins on every order and redeem them for instant discounts at checkout.
          </p>
        </div>

        {/* Global Toggle Status */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-xs font-bold">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>{totalCirculatingCoins.toLocaleString()} Active Coins</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Total Circulating Coins</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-ink">
            {totalCirculatingCoins.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-400">Coins</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Equivalent to ৳{(totalCirculatingCoins * Number(settings.redeemValue || 1)).toLocaleString()} in store credits
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Lifetime Earned by Users</span>
            <Award className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-bold font-display text-ink">
            {totalCoinsEarned.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-400">Coins</span>
          </div>
          <p className="text-[11px] text-stone-500">Across {wallets.length} active customer wallets</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Redemption Value</span>
            <Gift className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-display text-ink">
            1 Coin = ৳{settings.redeemValue}
          </div>
          <p className="text-[11px] text-stone-500">Min. {settings.minRedeem} coins required to redeem at checkout</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-line shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Settings2 className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-ink">Loyalty Coin Rules</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Earn Rate (Coins per ৳100 spent)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={settings.earnRate}
                    onChange={(e) => setSettings({ ...settings, earnRate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-stone-400 font-bold uppercase">Coins/৳100</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">E.g., 10 means 10 coins earned per ৳100 order value.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Coin Value (৳ per Coin at Checkout)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={settings.redeemValue}
                    onChange={(e) => setSettings({ ...settings, redeemValue: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-stone-400 font-bold uppercase">BDT (৳)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Minimum Coins to Redeem
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minRedeem}
                  onChange={(e) => setSettings({ ...settings, minRedeem: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  New Customer Signup Bonus Coins
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.welcomeBonus}
                  onChange={(e) => setSettings({ ...settings, welcomeBonus: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isActive}
                    onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest accent-forest"
                  />
                  <span className="text-xs font-bold text-stone-800">Loyalty Rewards Active</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Coin Rules</span>
            </button>
          </form>
        </div>

        {/* Customer Wallets Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-line">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-ink">Customer Coin Wallets ({wallets.length})</h3>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-hidden focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Balance</th>
                    <th className="p-3.5">Tier</th>
                    <th className="p-3.5">Total Earned</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-forest" />
                        Loading wallets...
                      </td>
                    </tr>
                  ) : filteredWallets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                        No customer wallets found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredWallets.map((w) => (
                      <tr key={w.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-stone-900">{w.user?.name || "Customer"}</p>
                          <p className="text-[11px] text-stone-400">{w.user?.phone || w.user?.email}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                            {w.coinsBalance} Coins
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 uppercase tracking-wide">
                            {w.tier || "SILVER"}
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-600 font-medium">
                          {w.totalEarned} Coins
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedUser(w);
                              setAdjustModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-forest hover:text-white text-stone-700 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Adjust Coins
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Coins Modal */}
      {adjustModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-line shadow-2xl">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Coins className="w-5 h-5 text-forest" />
              Adjust Coins: {selectedUser.user?.name}
            </h3>
            <p className="text-xs text-stone-500">
              Current Balance: <strong className="text-amber-700">{selectedUser.coinsBalance} Coins</strong>
            </p>

            <form onSubmit={handleAdjustCoins} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Adjustment Amount (Use negative for deduction, e.g. -20)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50 or -20"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:outline-hidden focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. VIP goodwill bonus, manual compensation"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModal(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
