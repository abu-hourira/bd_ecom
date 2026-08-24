"use client";
import { useEffect, useState } from "react";
import {
  Bike,
  Plus,
  Phone,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Shield,
  Trash2,
  Edit2,
  Navigation,
  RefreshCw,
  Search,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";
import { useLiveSync } from "@/lib/useLiveSync";

interface DeliveryRider {
  id: number;
  name: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
  isActive: boolean;
  isSharingLocation: boolean;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
  activeOrdersCount: number;
  createdAt: string;
}

export default function AdminDeliveryPage() {
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<DeliveryRider | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    vehicleType: "Motorbike",
    licenseNumber: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    type: "danger" | "warning" | "info" | "success";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    type: "warning",
    action: async () => {},
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchRiders = async () => {
    try {
      const res = await fetch("/api/admin/delivery-personnel", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setRiders(data.riders);
      }
    } catch (e) {
      console.error("Failed to load delivery personnel:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  // Real-time live synchronization every 6s
  useLiveSync(fetchRiders, { interval: 6000 });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/delivery-personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create rider account");
      }

      setAlertModal({
        isOpen: true,
        title: "Rider Account Created",
        message: `Successfully created delivery personnel account for ${formData.name} (${formData.phone}).`,
        type: "success",
      });

      setIsCreateOpen(false);
      setFormData({
        name: "",
        phone: "",
        password: "",
        vehicleType: "Motorbike",
        licenseNumber: "",
      });
      fetchRiders();
    } catch (err: any) {
      setAlertModal({
        isOpen: true,
        title: "Creation Error",
        message: err.message || "Failed to create rider",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRider) return;
    try {
      const res = await fetch("/api/admin/delivery-personnel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRider.id,
          ...formData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update rider");
      }

      setAlertModal({
        isOpen: true,
        title: "Account Updated",
        message: `Rider account for ${editingRider.name} was updated successfully.`,
        type: "success",
      });

      setEditingRider(null);
      fetchRiders();
    } catch (err: any) {
      setAlertModal({
        isOpen: true,
        title: "Update Error",
        message: err.message || "Failed to update rider",
        type: "error",
      });
    }
  };

  const toggleRiderStatus = (rider: DeliveryRider) => {
    const nextStatus = !rider.isActive;
    setConfirmModal({
      isOpen: true,
      title: nextStatus ? "Activate Delivery Rider" : "Deactivate Delivery Rider",
      message: nextStatus
        ? `Are you sure you want to activate ${rider.name}? They will be able to log in and receive assigned deliveries.`
        : `Are you sure you want to deactivate ${rider.name}? They will immediately be prevented from claiming new orders.`,
      confirmText: nextStatus ? "Activate" : "Deactivate",
      type: nextStatus ? "info" : "warning",
      action: async () => {
        const res = await fetch("/api/admin/delivery-personnel", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: rider.id, isActive: nextStatus }),
        });
        const data = await res.json();
        if (data.success) {
          fetchRiders();
        }
      },
    });
  };

  const deleteRider = (rider: DeliveryRider) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Rider: ${rider.name}`,
      message: `This action will permanently remove ${rider.name}'s account and unassign any active deliveries.`,
      confirmText: "Delete Rider",
      type: "danger",
      action: async () => {
        const res = await fetch(`/api/admin/delivery-personnel?id=${rider.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          fetchRiders();
        }
      },
    });
  };

  const filteredRiders = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.vehicleType.toLowerCase().includes(search.toLowerCase())
  );

  const activeRidersCount = riders.filter((r) => r.isActive).length;
  const liveBroadcastingCount = riders.filter(
    (r) => r.isSharingLocation && r.currentLat !== null
  ).length;
  const inTransitOrdersCount = riders.reduce((acc, r) => acc + r.activeOrdersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-3">
            <Bike className="w-8 h-8 text-forest" />
            <span>Delivery Fleet & Live Tracking</span>
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Manage delivery personnel accounts, live GPS tracking status, and order fulfillment.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: "",
              phone: "",
              password: "",
              vehicleType: "Motorbike",
              licenseNumber: "",
            });
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-paper font-semibold text-sm hover:bg-forest-deep transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Rider</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper p-5 rounded-2xl border border-line shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Total Fleet / Active
            </div>
            <div className="text-2xl font-bold text-ink mt-1">
              {activeRidersCount} <span className="text-xs font-normal text-ink-muted">/ {riders.length} riders</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-line shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Active Orders in Transit
            </div>
            <div className="text-2xl font-bold text-ink mt-1">{inTransitOrdersCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-line shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Live GPS Broadcasting
            </div>
            <div className="text-2xl font-bold text-forest mt-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>{liveBroadcastingCount} Riders</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Rider List Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rider by name, phone, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
          </div>

          <button
            onClick={fetchRiders}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg border border-line text-xs font-semibold text-ink-soft hover:text-ink transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Fleet</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading fleet roster...</div>
        ) : filteredRiders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bike className="w-12 h-12 text-ink-muted mx-auto opacity-40" />
            <div className="text-base font-semibold text-ink">No delivery riders found</div>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">
              Create your first delivery personnel account to start assigning orders and tracking live deliveries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg/60 text-xs font-semibold text-ink-soft uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="px-6 py-4">Rider Details</th>
                  <th className="px-6 py-4">Vehicle & License</th>
                  <th className="px-6 py-4">Active Deliveries</th>
                  <th className="px-6 py-4">Live GPS Status</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRiders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-bg/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink">{rider.name}</div>
                      <div className="text-xs text-ink-soft flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-forest" />
                        <span>{rider.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg border border-line text-xs font-medium text-ink">
                        <Bike className="w-3.5 h-3.5 text-earth" />
                        <span>{rider.vehicleType}</span>
                      </div>
                      {rider.licenseNumber && (
                        <div className="text-[11px] text-ink-muted mt-1 font-mono">
                          ID: {rider.licenseNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest bg-forest-soft px-2.5 py-1 rounded-lg">
                        <Package className="w-3.5 h-3.5" />
                        <span>{rider.activeOrdersCount} in progress</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {rider.isSharingLocation && rider.currentLat !== null ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Sharing Active
                          </span>
                          {rider.lastLocationUpdate && (
                            <div className="text-[10px] text-ink-muted flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{new Date(rider.lastLocationUpdate).toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                          <Radio className="w-3 h-3 text-stone-400" />
                          Offline / Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rider.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingRider(rider);
                            setFormData({
                              name: rider.name,
                              phone: rider.phone,
                              password: "",
                              vehicleType: rider.vehicleType,
                              licenseNumber: rider.licenseNumber || "",
                            });
                          }}
                          className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg transition"
                          title="Edit Rider"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleRiderStatus(rider)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            rider.isActive
                              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {rider.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteRider(rider)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete Rider"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Rider Modal */}
      {(isCreateOpen || editingRider) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-paper rounded-3xl border border-line shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                <Bike className="w-5 h-5 text-forest" />
                <span>{editingRider ? "Edit Delivery Rider" : "Add New Delivery Rider"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingRider(null);
                }}
                className="text-ink-muted hover:text-ink text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingRider ? handleEditSubmit : handleCreateSubmit}
              className="space-y-4 text-left"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamal Hossain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Phone Number (Login ID)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01711000111"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  {editingRider ? "New Password / PIN (leave blank to keep current)" : "Password / PIN"}
                </label>
                <input
                  type="password"
                  required={!editingRider}
                  placeholder="e.g. rider123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none"
                  >
                    <option value="Motorbike">Motorbike</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Van">Delivery Van</option>
                    <option value="On Foot">Walking / Foot</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">License / NID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. DH-12345"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingRider(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-ink-soft hover:bg-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-paper text-sm font-semibold hover:bg-forest-deep transition shadow-sm"
                >
                  {editingRider ? "Save Changes" : "Create Rider Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation & Alert Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
