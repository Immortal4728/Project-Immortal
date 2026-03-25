"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle, Eye, PowerOff, UserMinus, X, Users2 } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    account_active: boolean;
    last_login: string | null;
    created_at: string;
}

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CustomersPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: res, error: swrError, mutate: fetchCustomers } = useSWR("/api/admin/customers", fetcher);
    
    const customers = res?.success ? res.data : [];
    const loading = !res && !swrError;
    const error = swrError || (res && !res.success ? res.error : null);

    // Deletion Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [actionError, setActionError] = useState<string | null>(null);

    const toggleStatus = async (customer: Customer) => {
        try {
            setIsActionLoading(true);
            setActionError(null);
            const response = await fetch(`/api/admin/customers/${customer.id}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !customer.account_active }),
            });
            const data = await response.json();
            if (data.success) {
                fetchCustomers();
            } else {
                setActionError(data.error);
            }
        } catch (err) {
            console.error(err);
            setActionError("Failed to update status");
        } finally {
            setIsActionLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;
        try {
            setIsActionLoading(true);
            setActionError(null);
            const response = await fetch(`/api/admin/customers/${customerToDelete.id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                setShowDeleteModal(false);
                setCustomerToDelete(null);
                fetchCustomers();
            } else {
                setActionError(data.error);
            }
        } catch (err) {
            console.error(err);
            setActionError("Failed to delete account");
        } finally {
            setIsActionLoading(false);
        }
    };

    const confirmDeleteTrigger = (customer: Customer) => {
        setCustomerToDelete(customer);
        setShowDeleteModal(true);
    };

    const filteredCustomers = customers.filter((c: Customer) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="text-white w-full max-w-7xl mx-auto space-y-12 font-[family-name:var(--font-body)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">Customer Accounts</h1>
                    <p className="text-zinc-400 tracking-wide text-sm">Manage enrolled students and account status.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 w-full">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="text-rose-400 text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="bg-[#111111] border border-white/5 rounded-2xl w-full flex flex-col pt-6 pb-6 shadow-2xl min-h-[400px]">
                <div className="px-6 mb-6">
                    <div className="relative w-full max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search customers by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/5 text-white text-sm rounded-lg focus:ring-1 focus:ring-emerald-600 focus:border-emerald-500 block pl-10 p-2.5 outline-none transition-all placeholder-zinc-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <div className="overflow-x-auto w-full border-t border-white/5 pb-16">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#1a1a1a]/50 text-zinc-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Last Login</th>
                                    <th className="px-6 py-4 font-semibold">Created At</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredCustomers.map((c: Customer) => (
                                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                                        <td className="px-6 py-4 text-zinc-300">{c.email}</td>
                                        <td className="px-6 py-4">
                                            {c.account_active ? (
                                                <span className="px-2.5 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-lg border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-semibold uppercase">
                                                    Deactivated
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs font-mono">
                                            {c.last_login
                                                ? new Date(c.last_login).toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : "Never"
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs font-mono">
                                            {new Date(c.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 pointer-events-auto relative">
                                                <button
                                                    onClick={() => router.push(`/admin/submissions/${c.id}`)}
                                                    className="p-1.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    disabled={isActionLoading}
                                                    onClick={() => toggleStatus(c)}
                                                    className={`p-1.5 rounded-md transition-colors ${c.account_active ? "text-amber-500 hover:bg-amber-500/10 bg-amber-500/5" : "text-emerald-500 hover:bg-emerald-500/10 bg-emerald-500/5"} disabled:opacity-50`}
                                                    title={c.account_active ? "Deactivate Account" : "Reactivate Account"}
                                                >
                                                    <PowerOff className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDeleteTrigger(c)}
                                                    className="p-1.5 text-rose-500 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 rounded-md transition-colors"
                                                    title="Delete Account"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 pt-10 pb-6">
                        <div className="p-5 rounded-full bg-white/[0.02] border border-white/[0.05]">
                            <Users2 className="w-12 h-12 text-zinc-500 opacity-50" />
                        </div>
                        <p className="text-lg font-medium text-white tracking-tight">No customers found</p>
                        <p className="text-sm text-zinc-400 max-w-sm text-center">
                            Accounts automatically populate here once new projects are approved.
                        </p>
                    </div>
                )}
            </div>

            {/* Deletion Confirmation Modal */}
            {showDeleteModal && customerToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-[#111111] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                                <UserMinus className="w-6 h-6 text-rose-500" />
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-heading)]">
                                Delete Account?
                            </h3>
                            <p className="text-zinc-400 text-sm font-[family-name:var(--font-body)] leading-relaxed">
                                Are you sure you want to permanently delete <strong>{customerToDelete.name}</strong>'s access? This action revokes login permissions immediately. Project requests will be preserved without an attached account.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-end gap-3 font-[family-name:var(--font-body)]">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isActionLoading}
                                className="px-4 py-2 flex gap-2 items-center rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm focus:outline-none disabled:opacity-50"
                            >
                                {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
