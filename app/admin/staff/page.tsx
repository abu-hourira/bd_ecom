"use client";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/staff/page.tsx

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
  Pencil,
  Eye,
  Edit2,
  Trash,
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

  // Edit Staff Modal
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("MANAGER");
  const [editPassword, setEditPassword] = useState("");
  const [updatingStaff, setUpdatingStaff] = useState(false);

  // Delete / Action Modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

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
        setAlertState({
          isOpen: true,
          title: "Staff Creation Error",
          message: json.error || "Failed to create staff account.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setInviting(false);
    }
  };

  const openEditModal = (staffMember: any) => {
    setEditTarget(staffMember);
    setEditName(staffMember.name);
    setEditEmail(staffMember.email);
    setEditPhone(staffMember.phone || "");
    setEditRole(staffMember.role);
    setEditPassword("");
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setUpdatingStaff(true);
    try {
      const res = await fetch(`/api/admin/staff/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          role: editRole,
          password: editPassword.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEditTarget(null);
        setActionFeedback(json.message || "Staff member updated successfully.");
        setTimeout(() => setActionFeedback(null), 3000);
        fetchStaffData();
      } else {
        setAlertState({
          isOpen: true,
          title: "Update Error",
          message: json.error || "Failed to update staff member.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setUpdatingStaff(false);
    }
  };

  const handleInlineRoleChange = async (staffMember: any, newRole: string) => {
    if (staffMember.role === newRole) return;
    try {
      const res = await fetch(`/api/admin/staff/${staffMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (json.success) {
        setActionFeedback(`Role for ${staffMember.name} changed to ${newRole}.`);
        setTimeout(() => setActionFeedback(null), 3000);
        fetchStaffData();
      } else {
        setAlertState({
          isOpen: true,
          title: "Role Change Error",
          message: json.error || "Failed to change role.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
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
        setAlertState({
          isOpen: true,
          title: "Delete Blocked",
          message: json.error || "Failed to delete staff member.",
          type: "warning",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Action Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
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
        setAlertState({
          isOpen: true,
          title: "Status Update Error",
          message: json.error || "Failed to update staff status.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Action Error",
        message: e.message || "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  const handlePermissionToggle = async (
    roleName: string,
    module: string,
    field: "canRead" | "canCreate" | "canEdit" | "canDelete",
    currentVal: boolean
  ) => {
    // Optimistic UI update
    setPermissions((prev) => {
      const existingIdx = prev.findIndex((p) => p.role === roleName && p.module === module);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], [field]: !currentVal };
        return next;
      } else {
        return [...prev, { role: roleName, module, [field]: !currentVal }];
      }
    });

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
    } catch (e) {
      console.error(e);
      fetchStaffData();
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
            Manage admin team members, edit roles/credentials, and toggle granular permissions.
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
                  <th className="p-4">Role Assignment</th>
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
                        {s.role === "SUPER_ADMIN" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-amber-100 text-amber-900 border-amber-300">
                            SUPER_ADMIN
                          </span>
                        ) : (
                          <select
                            value={s.role}
                            onChange={(e) => handleInlineRoleChange(s, e.target.value)}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-line bg-bg focus:outline-none focus:border-forest cursor-pointer"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="MODERATOR">MODERATOR</option>
                          </select>
                        )}
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
                          {/* Edit Details Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-2 rounded-xl border border-line bg-white text-forest hover:bg-forest-soft text-xs font-semibold transition-all cursor-pointer"
                            title="Edit Staff Information & Role"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

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

      {/* Dynamic RBAC Permission Matrix Table (Toggle Switch Mode) */}
      <div className="bg-paper rounded-3xl border border-line shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-forest" />
              <span>Role Permissions Matrix (টগল মোড)</span>
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              যেকোনো রোলের অনুমতি সহজে টগল (On/Off) করে পরিবর্তন করুন। Super Admin সবসময় ফুল অ্যাক্সেস রাখবে।
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-ink-soft bg-bg px-4 py-2 rounded-2xl border border-line">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-forest" /> Read (দেখা)</span>
            <span className="flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5 text-blue-600" /> Write (এডিট)</span>
            <span className="flex items-center gap-1.5"><Trash className="w-3.5 h-3.5 text-rose-600" /> Delete (ডিলিট)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 w-40">Module Name</th>
                {roles.map((r) => (
                  <th key={r} className="p-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-xl bg-paper border border-line font-bold text-ink">
                      {r}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {modules.map((mod) => (
                <tr key={mod} className="hover:bg-bg/40 transition-colors">
                  <td className="p-4 font-bold text-ink uppercase tracking-wider text-xs">
                    {mod}
                  </td>
                  {roles.map((r) => {
                    const p = permissions.find((perm) => perm.role === r && perm.module === mod);
                    const canRead = p ? p.canRead : false;
                    const canEdit = p ? p.canEdit : false;
                    const canDelete = p ? p.canDelete : false;

                    return (
                      <td key={r} className="p-4 text-center">
                        <div className="inline-flex items-center justify-center gap-3 bg-bg/80 px-3 py-2 rounded-2xl border border-line/60">
                          {/* Read Toggle */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-ink-soft">Read:</span>
                            <button
                              type="button"
                              onClick={() => handlePermissionToggle(r, mod, "canRead", canRead)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                canRead ? "bg-forest" : "bg-stone-300 dark:bg-stone-600"
                              }`}
                              title={`Toggle Read for ${r} on ${mod}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  canRead ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Write Toggle */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-ink-soft">Write:</span>
                            <button
                              type="button"
                              onClick={() => handlePermissionToggle(r, mod, "canEdit", canEdit)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                canEdit ? "bg-blue-600" : "bg-stone-300 dark:bg-stone-600"
                              }`}
                              title={`Toggle Write/Edit for ${r} on ${mod}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  canEdit ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Delete Toggle */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-ink-soft">Delete:</span>
                            <button
                              type="button"
                              onClick={() => handlePermissionToggle(r, mod, "canDelete", canDelete)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                canDelete ? "bg-rose-600" : "bg-stone-300 dark:bg-stone-600"
                              }`}
                              title={`Toggle Delete for ${r} on ${mod}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  canDelete ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
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

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 01711223344"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Role Tier</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-semibold focus:outline-none focus:border-forest cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="MODERATOR">MODERATOR</option>
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
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono focus:outline-none focus:border-forest"
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

      {/* Edit Staff Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold font-display text-xl text-ink">Edit Staff Account</h3>
                <p className="text-xs text-ink-soft mt-0.5">Update staff name, contact, role tier, or password.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 01711223344"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Role Tier</label>
                  {editTarget.role === "SUPER_ADMIN" ? (
                    <input
                      type="text"
                      disabled
                      value="SUPER_ADMIN"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-100 border border-line text-xs font-bold text-stone-500"
                    />
                  ) : (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-semibold focus:outline-none focus:border-forest cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="MODERATOR">MODERATOR</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStaff}
                  className="px-6 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-premium disabled:opacity-50 cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  {updatingStaff ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
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

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
}
