"use client";
// app/admin/subscriptions/page.tsx
import { useEffect, useState } from "react";
import {
  Package,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  Save,
  Loader2,
  X,
  AlertCircle,
  Truck,
  DollarSign,
} from "lucide-react";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"plans" | "subscribers">("plans");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({
    id: null,
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
    frequency: "MONTHLY",
    discountPercent: "10",
    price: "",
    isActive: true,
  });

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

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
        setSubscribers(data.subscribers || []);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleOpenPlanModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        id: plan.id,
        title: plan.title,
        slug: plan.slug,
        description: plan.description || "",
        imageUrl: plan.imageUrl || "",
        frequency: plan.frequency || "MONTHLY",
        discountPercent: String(plan.discountPercent || "10"),
        price: String(plan.price || ""),
        isActive: plan.isActive !== false,
      });
    } else {
      setEditingPlan(null);
      setForm({
        id: null,
        title: "",
        slug: "",
        description: "",
        imageUrl: "",
        frequency: "MONTHLY",
        discountPercent: "10",
        price: "",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingPlan ? "UPDATE_PLAN" : "CREATE_PLAN",
          planData: form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Saved",
          message: data.message || "Subscription plan saved!",
          type: "success",
        });
        setModalOpen(false);
        fetchSubscriptions();
      } else {
        setAlert({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to save plan",
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

  const handleUpdateSubscriberStatus = async (subscriberId: number, status: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SUBSCRIBER_STATUS",
          subscriberId,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Status Updated",
          message: data.message,
          type: "success",
        });
        fetchSubscriptions();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Recurring Revenue & Retention</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Subscription Boxes & Recurring Orders
          </h2>
          <p className="text-xs text-ink-soft mt-0.5 max-w-2xl leading-relaxed">
            Create recurring grocery bundles (Weekly/Monthly) that automate repeat purchases for your pantry staples with subscriber discounts.
          </p>
        </div>

        <button
          onClick={() => handleOpenPlanModal()}
          className="px-4 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription Plan</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "plans"
              ? "border-forest text-forest"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Subscription Packages ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "subscribers"
              ? "border-forest text-forest"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Active Subscribers ({subscribers.length})
        </button>
      </div>

      {/* Tab: Plans */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 text-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-forest" />
              Loading subscription packages...
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-full p-12 text-center text-stone-400 bg-white rounded-3xl border border-line">
              No subscription plans configured yet. Click "Add Subscription Plan" to create one.
            </div>
          ) : (
            plans.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-stone-100 relative overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {p.discountPercent}% OFF
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {p.frequency}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-sm text-ink">{p.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-forest">৳{p.price}</span>
                      <span className="text-[11px] text-stone-400">/ per delivery</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {p.isActive ? "ACTIVE" : "DISABLED"}
                  </span>

                  <button
                    onClick={() => handleOpenPlanModal(p)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-forest hover:text-white border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Subscribers */}
      {activeTab === "subscribers" && (
        <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Subscription #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Package</th>
                  <th className="p-3.5">Frequency</th>
                  <th className="p-3.5">Next Delivery</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      No active customer subscriptions yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-forest">{s.subscriptionNumber}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-stone-900">{s.customerName}</p>
                        <p className="text-[11px] text-stone-400">{s.customerPhone}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-stone-800">{s.plan?.title || "Custom Box"}</td>
                      <td className="p-3.5 text-stone-600 font-medium">{s.frequency}</td>
                      <td className="p-3.5 text-stone-600">
                        {new Date(s.nextDeliveryDate).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            s.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.status === "PAUSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {s.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleUpdateSubscriberStatus(s.id, "PAUSED")}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateSubscriberStatus(s.id, "ACTIVE")}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                          >
                            Resume
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-line shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-ink">
                {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Plan Title</label>
                <input
                  type="text"
                  placeholder="e.g. মাসিক পরিবার পুষ্টি ও স্বাস্থ্য বক্স"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe included products and delivery frequency..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price per Delivery (৳)</label>
                  <input
                    type="number"
                    placeholder="2200"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Subscriber Discount (%)</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  >
                    <option value="WEEKLY">Weekly (সাপ্তাহিক)</option>
                    <option value="BI_WEEKLY">Bi-Weekly (প্রতি ১৫ দিনে)</option>
                    <option value="MONTHLY">Monthly (প্রতি মাসে)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest accent-forest"
                  />
                  <span className="text-xs font-bold text-stone-800">Publish & Show on Storefront</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan</span>
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
