"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  UserPlus,
  X,
  Loader2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Power,
  PowerOff,
  Eye,
  User,
  Mail,
  KeyRound,
  CalendarDays,
  Activity,
  Clock,
} from "lucide-react";

/* ─── Types ─── */
interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at?: string;
}

/* ─── Role badge colours ─── */
function roleBadgeClasses(role: string): string {
  switch (role.toLowerCase()) {
    case "manager":
      return "bg-violet-500/10 border-violet-500/20 text-violet-400";
    case "moderator":
      return "bg-sky-500/10 border-sky-500/20 text-sky-400";
    case "reviewer":
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    case "employee":
      return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
    case "admin":
      return "bg-rose-500/10 border-rose-500/20 text-rose-400";
    default:
      return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
  }
}

/* ─── Page ─── */
export default function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Invite modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile modal
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null);

  // Action confirmation
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    "deactivate" | "activate" | "delete" | null
  >(null);
  const [isActioning, setIsActioning] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ─── Close dropdown on outside click ─── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  /* ─── Data Fetch ─── */
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Fetch employees error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ─── Create User ─── */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "employee" });
        fetchEmployees();
      } else {
        setError(data.error || "Failed to create user.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Execute Action ─── */
  const executeAction = async () => {
    if (!actionId || !actionType) return;
    setIsActioning(true);
    try {
      if (actionType === "delete") {
        const res = await fetch(`/api/admin/employees/${actionId}`, {
          method: "DELETE",
        });
        if (res.ok) fetchEmployees();
      } else {
        const res = await fetch(`/api/admin/employees/${actionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: actionType }),
        });
        if (res.ok) fetchEmployees();
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setIsActioning(false);
      setActionId(null);
      setActionType(null);
    }
  };

  /* ─── Filtered List ─── */
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  /* ─── Helpers ─── */
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <div className="text-white w-full max-w-7xl mx-auto space-y-10 font-[family-name:var(--font-body)]">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
                Team Members
              </h1>
              <p className="text-zinc-500 tracking-wide text-sm mt-0.5">
                Manage internal employees and team access.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 md:py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 text-sm font-semibold tracking-wide w-full md:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>

        {/* ─── Table Card ─── */}
        <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl w-full flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.4)] min-h-[400px] overflow-hidden">
          {/* Search */}
          <div className="px-6 py-5 border-b border-white/[0.04]">
            <div className="relative w-full max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 block pl-10 p-2.5 outline-none transition-all placeholder-zinc-600"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
              </div>
              <p className="text-zinc-600 text-sm">Loading team members...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <>
              {/* ─── Mobile Card Layout (below md) ─── */}
              <div className="md:hidden divide-y divide-white/[0.04]">
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="p-4 space-y-3">
                    {/* Top: Avatar + Name + Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center flex-shrink-0 ring-1 ring-white/[0.06]">
                          {emp.profile_picture ? (
                            <img src={emp.profile_picture} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-500 select-none">{getInitials(emp.name)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{emp.name}</p>
                          <p className="text-zinc-500 text-xs truncate">{emp.email}</p>
                        </div>
                      </div>
                      <div className="relative inline-block text-left shrink-0" ref={openDropdown === emp.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === emp.id ? null : emp.id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdown === emp.id && (
                          <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] bg-[#141414] border border-white/[0.08] z-50 py-1.5 overflow-hidden">
                            <button onClick={() => { setProfileEmployee(emp); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white w-full text-left transition-colors">
                              <Eye className="w-4 h-4 text-zinc-500" /> View Profile
                            </button>
                            <div className="h-px bg-white/[0.04] mx-3 my-1" />
                            {emp.active || emp.active === undefined ? (
                              <button onClick={() => { setActionId(emp.id); setActionType("deactivate"); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-3 text-sm text-amber-400 hover:bg-amber-500/[0.06] w-full text-left transition-colors">
                                <PowerOff className="w-4 h-4" /> Deactivate
                              </button>
                            ) : (
                              <button onClick={() => { setActionId(emp.id); setActionType("activate"); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-500/[0.06] w-full text-left transition-colors">
                                <Power className="w-4 h-4" /> Activate
                              </button>
                            )}
                            <button onClick={() => { setActionId(emp.id); setActionType("delete"); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/[0.06] w-full text-left transition-colors">
                              <Trash2 className="w-4 h-4" /> Remove User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Bottom: Role + Status + Date */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold capitalize ${roleBadgeClasses(emp.role)}`}>
                        {emp.role}
                      </span>
                      {emp.active || emp.active === undefined ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-semibold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-semibold bg-rose-500/10 border-rose-500/20 text-rose-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Deactivated
                        </span>
                      )}
                      <span className="text-zinc-600 text-[11px] ml-auto">{formatDate(emp.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── Desktop Table (md and above) ─── */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="px-6 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Member</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Role</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Status</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] text-right">Joined</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="group border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center flex-shrink-0 ring-1 ring-white/[0.06]">
                              {emp.profile_picture ? (
                                <img src={emp.profile_picture} alt={emp.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-zinc-500 select-none">{getInitials(emp.name)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-sm truncate">{emp.name}</p>
                              <p className="text-zinc-500 text-xs truncate">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold capitalize ${roleBadgeClasses(emp.role)}`}>{emp.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          {emp.active || emp.active === undefined ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-rose-500/10 border-rose-500/20 text-rose-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Deactivated
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-500 text-xs">{formatDate(emp.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block text-left" ref={openDropdown === emp.id ? dropdownRef : null}>
                            <button
                              onClick={() => setOpenDropdown(openDropdown === emp.id ? null : emp.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openDropdown === emp.id && (
                              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] bg-[#141414] border border-white/[0.08] z-50 py-1.5 overflow-hidden">
                                <button onClick={() => { setProfileEmployee(emp); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white w-full text-left transition-colors">
                                  <Eye className="w-4 h-4 text-zinc-500" /> View Profile
                                </button>
                                <div className="h-px bg-white/[0.04] mx-3 my-1" />
                                {emp.active || emp.active === undefined ? (
                                  <button onClick={() => { setActionId(emp.id); setActionType("deactivate"); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/[0.06] w-full text-left transition-colors">
                                    <PowerOff className="w-4 h-4" /> Deactivate
                                  </button>
                                ) : (
                                  <button onClick={() => { setActionId(emp.id); setActionType("activate"); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/[0.06] w-full text-left transition-colors">
                                    <Power className="w-4 h-4" /> Activate
                                  </button>
                                )}
                                <button onClick={() => { setActionId(emp.id); setActionType("delete"); setOpenDropdown(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/[0.06] w-full text-left transition-colors">
                                  <Trash2 className="w-4 h-4" /> Remove User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Users className="w-7 h-7 text-zinc-600" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-white tracking-tight">
                  No team members found
                </p>
                <p className="text-sm text-zinc-500 max-w-xs mt-1.5">
                  {searchTerm
                    ? "Try a different search query."
                    : "Invite team members to grant them access to this dashboard."}
                </p>
              </div>
            </div>
          )}

          {/* Row count footer */}
          {!loading && filteredEmployees.length > 0 && (
            <div className="px-6 py-3.5 border-t border-white/[0.04] flex items-center justify-between">
              <p className="text-xs text-zinc-600">
                Showing{" "}
                <span className="text-zinc-400 font-medium">
                  {filteredEmployees.length}
                </span>{" "}
                of{" "}
                <span className="text-zinc-400 font-medium">
                  {employees.length}
                </span>{" "}
                team members
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PROFILE MODAL
         ═══════════════════════════════════════════════════════════ */}
      {profileEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setProfileEmployee(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/[0.06] rounded-full blur-[60px] pointer-events-none" />

            {/* Header */}
            <div className="relative px-7 pt-7 pb-0 flex justify-between items-start">
              <h3 className="text-lg font-bold text-white tracking-tight font-[family-name:var(--font-heading)]">
                Employee Profile
              </h3>
              <button
                onClick={() => setProfileEmployee(null)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-7 py-7 space-y-7">
              {/* Avatar + Name + Role */}
              <div className="flex items-center gap-5">
                <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-zinc-800 ring-[3px] ring-white/[0.06] ring-offset-[4px] ring-offset-[#0e0e0e] flex items-center justify-center flex-shrink-0">
                  {profileEmployee.profile_picture ? (
                    <img
                      src={profileEmployee.profile_picture}
                      alt={profileEmployee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-zinc-500 select-none">
                      {getInitials(profileEmployee.name)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xl font-bold text-white tracking-tight truncate">
                    {profileEmployee.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold capitalize ${roleBadgeClasses(
                        profileEmployee.role,
                      )}`}
                    >
                      {profileEmployee.role}
                    </span>
                    {profileEmployee.active ||
                      profileEmployee.active === undefined ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-semibold text-rose-400">
                        <span className="w-1 h-1 rounded-full bg-rose-400" />
                        Deactivated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email */}
                <div className="group/f flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover/f:border-emerald-500/20 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 group-hover/f:text-emerald-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-0.5">
                      Email
                    </p>
                    <p className="text-sm text-zinc-300 font-medium truncate">
                      {profileEmployee.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="group/f flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover/f:border-indigo-500/20 transition-colors">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-500 group-hover/f:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-0.5">
                      Role
                    </p>
                    <p className="text-sm text-zinc-300 font-medium capitalize">
                      {profileEmployee.role}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="group/f flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover/f:border-emerald-500/20 transition-colors">
                    <Activity className="w-3.5 h-3.5 text-zinc-500 group-hover/f:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-0.5">
                      Account Status
                    </p>
                    <p
                      className={`text-sm font-medium ${profileEmployee.active ||
                          profileEmployee.active === undefined
                          ? "text-emerald-400"
                          : "text-rose-400"
                        }`}
                    >
                      {profileEmployee.active ||
                        profileEmployee.active === undefined
                        ? "Active"
                        : "Deactivated"}
                    </p>
                  </div>
                </div>

                {/* Created */}
                <div className="group/f flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover/f:border-amber-500/20 transition-colors">
                    <CalendarDays className="w-3.5 h-3.5 text-zinc-500 group-hover/f:text-amber-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-0.5">
                      Account Created
                    </p>
                    <p className="text-sm text-zinc-300 font-medium">
                      {formatDateTime(profileEmployee.created_at)}
                    </p>
                  </div>
                </div>

                {/* Last Activity */}
                {profileEmployee.updated_at && (
                  <div className="group/f flex items-start gap-3 sm:col-span-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover/f:border-sky-500/20 transition-colors">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 group-hover/f:text-sky-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-0.5">
                        Last Updated
                      </p>
                      <p className="text-sm text-zinc-300 font-medium">
                        {formatDateTime(profileEmployee.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setProfileEmployee(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INVITE MODAL
         ═══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#0e0e0e] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
                Invite Team Member
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateUser} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 p-3 outline-none transition-all placeholder-zinc-600"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 p-3 outline-none transition-all placeholder-zinc-600"
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 p-3 outline-none transition-all placeholder-zinc-600"
                    placeholder="Assign a secure password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 p-3 outline-none transition-all"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="moderator">Moderator</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>
                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Invite User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ACTION CONFIRMATION MODAL
         ═══════════════════════════════════════════════════════════ */}
      {actionId && actionType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => {
              setActionId(null);
              setActionType(null);
            }}
          />
          <div className="relative w-full max-w-sm bg-[#0e0e0e] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.7)] p-7 text-center">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${actionType === "delete"
                  ? "bg-rose-500/10 text-rose-500"
                  : actionType === "activate"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
            >
              {actionType === "delete" ? (
                <Trash2 className="w-6 h-6" />
              ) : actionType === "activate" ? (
                <Power className="w-6 h-6" />
              ) : (
                <PowerOff className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 capitalize">
              {actionType} User?
            </h3>
            <p className="text-zinc-500 text-sm mb-7 leading-relaxed">
              Are you sure you want to {actionType} this user?
              {actionType === "delete"
                ? " This action cannot be undone."
                : actionType === "deactivate"
                  ? " They will not be able to log in until activated again."
                  : " They will regain access to the dashboard."}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isActioning}
                onClick={() => {
                  setActionId(null);
                  setActionType(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-white hover:bg-white/[0.08] transition-colors text-sm font-semibold border border-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAction}
                disabled={isActioning}
                className={`flex-1 py-2.5 rounded-xl text-white transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg ${actionType === "delete"
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                    : actionType === "activate"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                      : "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20"
                  }`}
              >
                {isActioning && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionType === "delete"
                  ? "Delete"
                  : actionType === "activate"
                    ? "Activate"
                    : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
