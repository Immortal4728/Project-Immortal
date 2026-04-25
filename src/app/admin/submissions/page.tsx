"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Unplug } from "lucide-react";
import { SubmissionsTable, TableSubmission } from "@/components/admin/SubmissionsTable";
import Alert from "@/components/ui/alert";

import useSWR, { preload } from "swr";
const fetcher = (url: string) => fetch(url).then(res => res.json());

/* ─── Build the paginated API URL ─── */
const LIMIT = 20;
const buildUrl = (page: number) => `/api/admin/submissions?page=${page}&limit=${LIMIT}`;

export default function SubmissionsPage() {
    const [page, setPage] = useState(1);
    const [actionAlert, setActionAlert] = useState<{ type: "success" | "error" | "info" | "warning", message: string } | null>(null);

    // ── SWR with keepPreviousData: table stays visible while next page loads ──
    const { data: subRes, error: swrError, mutate: fetchSubmissions, isValidating } = useSWR(
        buildUrl(page),
        fetcher,
        { keepPreviousData: true }
    );

    const submissions = subRes?.success ? subRes.data : [];
    const hasMore = subRes?.success ? subRes.hasMore : false;

    // Initial load (no data yet) vs page-switch revalidation
    const loading = !subRes && !swrError;
    const apiError = swrError || (subRes && !subRes.success);

    // ── Prefetch the next page so "Next" feels instant ──
    useEffect(() => {
        if (hasMore) {
            preload(buildUrl(page + 1), fetcher);
        }
    }, [page, hasMore]);

    // ── Stable callback ref to avoid unnecessary child re-renders ──
    const handleStatusUpdate = useCallback(async (id: string | number, newStatus: string) => {
        try {
            const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            const res = await fetch(`/api/admin/update-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: capitalizedStatus })
            });

            const data = await res.json();

            if (data && data.success) {
                await fetchSubmissions();
                setActionAlert({ type: "success", message: `Status updated to ${capitalizedStatus}` });
                setTimeout(() => setActionAlert(null), 3000);
            } else {
                setActionAlert({ type: "error", message: data?.error || "Failed to update status" });
                setTimeout(() => setActionAlert(null), 3000);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            setActionAlert({ type: "error", message: "Unexpected error while updating submission." });
            setTimeout(() => setActionAlert(null), 3000);
        }
    }, [fetchSubmissions]);

    return (
        <div className="w-full text-white space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-white font-[family-name:var(--font-heading)]">Submissions</h1>
                <p className="text-zinc-500 tracking-wide text-sm font-[family-name:var(--font-body)]">
                    Review and manage incoming project requests.
                </p>
            </div>

            {actionAlert && (
                <Alert type={actionAlert.type} message={actionAlert.message} />
            )}

            <div className="relative min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4 rounded-2xl border border-white/[0.06] bg-zinc-900/60">
                        <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                        <p className="text-sm font-medium tracking-wide text-zinc-500">Loading submissions...</p>
                    </div>
                ) : apiError ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4 rounded-2xl border border-rose-500/10 bg-rose-500/[0.03]">
                        <div className="p-3 bg-rose-500/10 rounded-xl">
                            <Unplug className="w-6 h-6 text-rose-500 opacity-80" />
                        </div>
                        <p className="text-rose-400 font-semibold tracking-wide text-sm">Connection Failed</p>
                        <p className="text-xs text-zinc-500 text-center max-w-sm">
                            Could not connect to the database. Ensure your backend is reachable.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <SubmissionsTable
                                submissions={submissions}
                                onUpdateStatus={handleStatusUpdate}
                            />
                            {/* Subtle overlay indicator while switching pages */}
                            {isValidating && !loading && (
                                <div className="absolute top-4 right-4 flex items-center justify-center space-x-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm z-10">
                                    <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                                    <span className="text-xs text-zinc-400 font-medium tracking-wide">Updating…</span>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-2 py-4 mt-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-zinc-500 font-medium">Page {page}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasMore}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
