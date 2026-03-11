"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Unplug } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { SubmissionsTable, TableSubmission } from "@/components/admin/SubmissionsTable";
import Alert from "@/components/ui/alert";

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<TableSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);
    const [actionAlert, setActionAlert] = useState<{ type: "success" | "error" | "info" | "warning", message: string } | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setApiError(false);

            const { data, error } = await insforge.database
                .from("project_requests")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Failed to fetch from InsForge. Error:", error);
                setApiError(true);
            } else {
                setSubmissions(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            setApiError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string | number, newStatus: string) => {
        try {
            const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            const res = await fetch(`/api/admin/update-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, status: capitalizedStatus })
            });

            const data = await res.json();

            if (data && data.success) {
                await fetchSubmissions(); // Refresh the submissions list so the new status appears
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
    };

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
                    <SubmissionsTable
                        submissions={submissions}
                        onUpdateStatus={handleStatusUpdate}
                    />
                )}
            </div>
        </div>
    );
}
