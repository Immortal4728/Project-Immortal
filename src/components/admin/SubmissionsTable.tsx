"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X, Search, Filter, Inbox, ChevronDown } from "lucide-react";

export interface TableSubmission {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    college?: string;
    domain: string;
    description?: string;
    project_title?: string;
    status?: string;
    created_at?: string;
    date?: string;
    submittedAt?: string;
    [key: string]: unknown;
}

interface SubmissionsTableProps {
    submissions: TableSubmission[];
    onUpdateStatus: (id: string | number, status: string) => Promise<void> | void;
    hideSearchAndFilter?: boolean;
    isDashboard?: boolean;
}

/* ─── Status Dropdown Component ─── */
function StatusDropdown({ currentStatus, onSelect }: { currentStatus: string; onSelect: (status: string) => void }) {
    const [open, setOpen] = useState(false);
    const statusLower = currentStatus?.toLowerCase() || 'pending';

    const options = ['pending', 'approved', 'rejected'];

    const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
        approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
        rejected: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' },
    };

    const c = colorMap[statusLower] || colorMap.pending;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide capitalize cursor-pointer transition-all duration-200 hover:brightness-125 ${c.bg} ${c.text} ${c.border}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {statusLower}
                <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-[95] w-36 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden py-1">
                        {options.map((opt) => {
                            const oc = colorMap[opt];
                            const isActive = opt === statusLower;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (opt !== statusLower) onSelect(opt);
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-medium tracking-wide capitalize flex items-center gap-2.5 transition-colors
                                        ${isActive ? 'bg-white/5 text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${oc.dot}`} />
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Main Table (memoized to prevent re-renders when only page state changes) ─── */
export const SubmissionsTable = React.memo(function SubmissionsTable({ submissions, onUpdateStatus, hideSearchAndFilter = false, isDashboard = false }: SubmissionsTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const getStatusColor = (status?: string) => {
        const lower = status?.toLowerCase() || 'pending';
        switch (lower) {
            case 'approved':
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'rejected':
                return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default:
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        }
    };

    const getFormattedDate = (sub: TableSubmission) => {
        const d = sub.created_at || sub.date || sub.submittedAt;
        if (!d) return "N/A";
        return new Date(d).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredSubmissions = useMemo(() => {
        let filtered = submissions.filter((sub) => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch =
                sub.name?.toLowerCase().includes(lowerSearch) ||
                sub.email?.toLowerCase().includes(lowerSearch) ||
                sub.domain?.toLowerCase().includes(lowerSearch) ||
                sub.project_title?.toLowerCase().includes(lowerSearch) ||
                (sub.college && sub.college.toLowerCase().includes(lowerSearch));

            const currentStatus = sub.status ? sub.status.toLowerCase() : "pending";
            const matchesStatus =
                statusFilter === "All" ||
                (statusFilter === "Pending" && currentStatus === "pending") ||
                (statusFilter === "Approved" && currentStatus === "approved") ||
                (statusFilter === "Rejected" && currentStatus === "rejected");

            return matchesSearch && matchesStatus;
        });

        if (isDashboard) {
            filtered = filtered.slice(0, 5);
        }

        return filtered;
    }, [submissions, searchTerm, statusFilter, isDashboard]);

    const colCount = isDashboard ? 6 : 7;

    return (
        <div className="w-full flex flex-col space-y-4 font-[family-name:var(--font-body)]">
            {/* ─── Search & Filter Bar ─── */}
            {!hideSearchAndFilter && (
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-900/80 p-3 rounded-xl border border-white/[0.06]">
                    <div className="relative w-full sm:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, project title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-800/60 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 block pl-10 p-2.5 outline-none transition-all placeholder-zinc-500"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-44 flex items-center">
                        <Filter className="absolute left-3 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-zinc-800/60 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 block w-full pl-9 pr-9 p-2.5 outline-none transition-all appearance-none cursor-pointer hover:bg-zinc-800"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Data Table ─── */}
            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900 border-b border-white/[0.06] text-zinc-500">
                            <tr>
                                <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase">Applicant</th>
                                {!isDashboard && <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase">Phone</th>}
                                <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase">Project Title</th>
                                <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase">Domain</th>
                                <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase">Date</th>
                                <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase">Status</th>
                                <th className="px-5 py-3.5 font-medium tracking-wider text-[11px] uppercase text-right">
                                    {isDashboard ? "" : "Actions"}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                                            <Inbox className="w-10 h-10 text-zinc-600" />
                                            <p className="text-zinc-500 tracking-wide text-xs font-medium">No submissions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((sub, idx) => {
                                    const statusLower = (sub.status || 'pending').toLowerCase();
                                    return (
                                        <tr key={sub.id || idx} className="hover:bg-white/[0.02] transition-colors duration-150 group">
                                            {/* Applicant */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/20 flex items-center justify-center text-indigo-300 font-bold text-[10px] uppercase ring-1 ring-indigo-500/20">
                                                        {sub.name ? sub.name.substring(0, 2) : "?"}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-white font-medium text-[13px] truncate">{sub.name}</span>
                                                        <span className="text-zinc-500 text-[11px] truncate">{sub.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Phone */}
                                            {!isDashboard && (
                                                <td className="px-5 py-3.5 text-zinc-400 text-[13px]">{sub.phone || "—"}</td>
                                            )}
                                            {/* Project Title */}
                                            <td className="px-5 py-3.5">
                                                <span className="text-zinc-300 text-[13px] max-w-[180px] truncate block" title={sub.project_title || "Untitled Project"}>
                                                    {sub.project_title || "Untitled Project"}
                                                </span>
                                            </td>
                                            {/* Domain */}
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 border border-white/[0.06] text-zinc-400 text-[11px] font-medium tracking-wide">
                                                    {sub.domain}
                                                </span>
                                            </td>
                                            {/* Date */}
                                            <td className="px-5 py-3.5 text-zinc-500 text-[13px]">
                                                {getFormattedDate(sub)}
                                            </td>
                                            {/* Status */}
                                            <td className="px-5 py-3.5">
                                                {isDashboard ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold tracking-wide capitalize ${getStatusColor(sub.status)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusLower === 'approved' ? 'bg-emerald-400' : statusLower === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                                                        {statusLower}
                                                    </span>
                                                ) : (
                                                    <StatusDropdown
                                                        currentStatus={sub.status || 'pending'}
                                                        onSelect={(newStatus) => onUpdateStatus(sub.id, newStatus)}
                                                    />
                                                )}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            router.push(`/admin/submissions/${sub.id}`);
                                                        }}
                                                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});
