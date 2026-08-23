// app/admin/staff/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  Plus,
  KeyRound,
  CheckCircle2,
  Lock,
  Loader2,
  UserCheck,
  AlertTriangle,
  Trash2,
  Power,
  X,
  AlertCircle,
} from "lucide-react";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("MANAGER");
  const [password, setPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Delete / Action Modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchStaffData = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const json = await res.json();
      if (json.success) {
        setStaff(json.staff || []);
        setPermissions(json.permissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, password, twoFactorEnabled: twoFactor }),
      });

      const json = await res.json();
      if (json.success) {
        setShowInviteModal(false);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setActionFeedback("New staff account created successfully.");
        setTimeout(() => setActionFeedback(null), 3000);
        fetchStaffData();
      } else {
        alert(json.error || "Failed to create staff account");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/staff/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        setActionFeedback(json.message);
        setTimeout(() => setActionFeedback(null), 3000);
        fetchStaffData();
      } else {
        alert(json.error || "Failed to delete staff member.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (staffMember: any) => {
    const isCurrentlyDeactivated = Boolean(staffMember.lockedUntil && new Date(staffMember.lockedUntil) > new Date());
    const nextState = !isCurrentlyDeactivated;

    try {
      const res = await fetch(`/api/admin/staff/${staffMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeactivated: nextState }),
      });

      const json = await res.json();
      if (json.success) {
        setActionFeedback(json.message);
        setTimeout(() => setActionFeedback(null), 3000);
        fetchStaffData();
      } else {
        alert(json.error || "Failed to update staff status.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handlePermissionToggle = async (
    roleName: string,
    module: string,
    field: "canRead" | "canCreate" | "canEdit" | "canDelete",
    currentVal: boolean
  ) => {
    try {
      await fetch("/api/admin/staff/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleName,
          module,
          [field]: !currentVal,
        }),
      });
      fetchStaffData();
    } catch (e) {
      console.error(e);
    }
  };

  const roles = ["ADMIN", "MANAGER", "MODERATOR"];
  const modules = ["products", "orders", "inventory", "promos", "content", "settings", "notifications", "api", "staff", "returns"];

  const superAdminCount = staff.filter((s) => s.role === "SUPER_ADMIN").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Staff & Permissions Matrix
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Manage admin team members, role assignments, security 2FA, and granular module permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>Create Staff Account</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-forest text-white text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Staff Members List */}
      <div className="bg-paper rounded-3xl border border-line shadow-xs overflow-hidden">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-forest" />
            <h3 className="font-bold font-display text-base text-ink">
              Active Staff Members ({staff.length})
            </h3>
          </div>
          <span className="text-xs text-ink-soft font-mono">
            {superAdminCount} Super Admin{superAdminCount > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-ink-soft flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-forest" />
            <span className="text-xs">Loading staff accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Email & Phone</th>
                  <th className="p-4">Role Tier</th>
                  <th className="p-4">Security Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {staff.map((s) => {
                  const isDeactivated = Boolean(s.lockedUntil && new Date(s.lockedUntil) > new Date());
                  const isLastSuperAdmin = s.role === "SUPER_ADMIN" && superAdminCount <= 1;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-bg/40 transition-colors ${
                        isDeactivated ? "opacity-60 bg-stone-100/50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-forest text-accent font-bold flex items-center justify-center text-xs">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-ink text-xs block">{s.name}</span>
                            {s.role === "SUPER_ADMIN" && (
                              <span className="text-[10px] text-amber-600 font-semibold font-mono">
                                Master Root Account
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-xs">
                        <div className="text-ink">{s.email}</div>
                        <div className="text-ink-soft text-[11px]">{s.phone || "No phone added"}</div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            s.role === "SUPER_ADMIN"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : s.role === "ADMIN"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : s.role === "MANAGER"
                              ? "bg-blue-100 text-blue-900 border-blue-300"
                              : "bg-purple-100 text-purple-900 border-purple-300"
                          }`}
                        >
                          {s.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {isDeactivated ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
                              <Lock className="w-3 h-3" />
                              <span>Deactivated / Locked</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          )}
                          {s.twoFactorEnabled && (
                            <div className="text-[10px] text-forest font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>2FA Enforced</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Deactivate / Reactivate */}
                          <button
                            type="button"
                            disabled={isLastSuperAdmin}
                            onClick={() => handleToggleActive(s)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isLastSuperAdmin
                                ? "opacity-30 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200"
                                : isDeactivated
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-white text-stone-600 border-line hover:bg-bg hover:text-ink"
                            }`}
                            title={
                              isLastSuperAdmin
                                ? "Cannot deactivate the last Super Admin"
                                : isDeactivated
                                ? "Reactivate Staff Account"
                                : "Temporarily Deactivate"
                            }
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isLastSuperAdmin}
                            onClick={() => setDeleteTarget(s)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isLastSuperAdmin
                                ? "opacity-30 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200"
                                : "bg-white text-rose-600 border-line hover:bg-rose-50 hover:border-rose-300"
                            }`}
                            title={
                              isLastSuperAdmin
                                ? "Cannot delete the last Super Admin account"
                                : "Permanently Delete Staff Account"
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic RBAC Permission Matrix Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-line pb-4">
          <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-forest" />
            <span>Configurable Role Permission Matrix</span>
          </h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Super Admin possesses unrestricted access. Super Admin can adjust permissions for Admin, Manager, and Moderator below.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Module</th>
                {roles.map((r) => (
                  <th key={r} className="p-3 text-center">
                    {r} (Read / Write / Delete)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {modules.map((mod) => (
                <tr key={mod} className="hover:bg-bg/40">
                  <td className="p-3 font-bold text-ink uppercase tracking-wider text-[11px]">
                    {mod}
                  </td>
                  {roles.map((r) => {
                    const p = permissions.find((perm) => perm.role === r && perm.module === mod);
                    const canRead = p ? p.canRead : false;
                    const canEdit = p ? p.canEdit : false;
                    const canDelete = p ? p.canDelete : false;

                    return (
                      <td key={r} className="p-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[10px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={canRead}
                              onChange={() => handlePermissionToggle(r, mod, "canRead", canRead)}
                              className="w-3.5 h-3.5 text-forest rounded cursor-pointer"
                            />
                            <span>R</span>
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={canEdit}
                              onChange={() => handlePermissionToggle(r, mod, "canEdit", canEdit)}
                              className="w-3.5 h-3.5 text-forest rounded cursor-pointer"
                            />
                            <span>W</span>
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={canDelete}
                              onChange={() => handlePermissionToggle(r, mod, "canDelete", canDelete)}
                              className="w-3.5 h-3.5 text-forest rounded cursor-pointer"
                            />
                            <span>D</span>
                          </label>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold font-display text-xl text-ink">Create Staff Account</h3>
                <p className="text-xs text-ink-soft mt-0.5">Assign a fixed role tier and login credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hasan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Staff Email</label>
                <input
                  type="email"
                  required
                  placeholder="staff@enmar.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Role Tier</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-xs font-semibold focus:outline-none focus:border-forest"
                  >
                    <option value="ADMIN">Admin (Broad Ops)</option>
                    <option value="MANAGER">Manager (Daily Orders)</option>
                    <option value="MODERATOR">Moderator (Content)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-xs font-mono focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="w-4 h-4 text-forest rounded"
                />
                <span>Enforce Two-Factor Authentication (2FA) for this staff</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-6 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-premium disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {inviting ? "Creating..." : "Save Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-6 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold font-display text-lg text-ink">Delete Staff Member?</h3>
                <p className="text-xs text-ink-soft mt-0.5">This action will immediately revoke their admin access.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg border border-line space-y-1.5 text-xs">
              <div>
                <span className="text-ink-soft">Name: </span>
                <strong className="text-ink">{deleteTarget.name}</strong>
              </div>
              <div>
                <span className="text-ink-soft">Email: </span>
                <span className="font-mono text-ink">{deleteTarget.email}</span>
              </div>
              <div>
                <span className="text-ink-soft">Role: </span>
                <span className="font-bold text-forest">{deleteTarget.role}</span>
              </div>
            </div>

            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
              ⚠️ <strong>Warning:</strong> The staff member will be removed from the active system and archived in the audit recycle bin.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={deleting}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-premium disabled:opacity-50 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
