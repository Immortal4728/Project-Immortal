"use client";

import { useEffect, useState } from "react";
import { Folder, Clock, CheckCircle, XCircle } from "lucide-react";
import Alert from "@/components/ui/alert";
import { StatsCard } from "@/components/admin/StatsCard";
import { SubmissionsTable, TableSubmission } from "@/components/admin/SubmissionsTable";
import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";

type Analytics = {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
};

export default function Dashboard() {
    const [submissions, setSubmissions] = useState<TableSubmission[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionAlert, setActionAlert] = useState<{ type: "success" | "error" | "info" | "warning", message: string } | null>(null);

    /* ─── Data Fetching ─── */
    useEffect(() => {
        Promise.all([
            fetch("/api/admin/submissions").then((res) => {
                if (!res.ok) throw new Error("Failed to fetch submissions");
                return res.json();
            }),
            fetch("/api/admin/dashboard/stats").then((res) => {
                if (!res.ok) throw new Error("Failed to fetch dashboard stats");
                return res.json();
            })
        ])
            .then(([subData, analyticsData]) => {
                if (subData && subData.success) {
                    setSubmissions(subData.data);
                } else {
                    setError(subData?.error || "Failed to fetch submissions");
                }
                if (analyticsData && analyticsData.success) {
                    setAnalytics(analyticsData.data);
                } else {
                    setError(analyticsData?.error || "Failed to fetch dashboard stats");
                }
            })
            .catch((err) => {
                setError(err.message || "An error occurred fetching dashboard data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    /* ─── Refresh data helper ─── */
    const refreshData = async () => {
        try {
            const [subRes, analyticsRes] = await Promise.all([
                fetch("/api/admin/submissions").then((r) => r.json()),
                fetch("/api/admin/dashboard/stats").then((r) => r.json()),
            ]);
            if (subRes && subRes.success) setSubmissions(subRes.data);
            if (analyticsRes && analyticsRes.success) setAnalytics(analyticsRes.data);
        } catch (e) {
            console.error("Failed to refresh data:", e);
        }
    };

    /* ─── Status Update Handler ─── */
    const handleUpdateStatus = async (id: string | number, status: string) => {
        try {
            const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
            const res = await fetch("/api/admin/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: capitalizedStatus }),
            });
            const data = await res.json();
            if (data && data.success) {
                await refreshData();
                setActionAlert({ type: "success", message: `Status updated to ${capitalizedStatus}` });
                setTimeout(() => setActionAlert(null), 3000);
            } else {
                setActionAlert({ type: "error", message: data?.error || "Failed to update status" });
                setTimeout(() => setActionAlert(null), 3000);
            }
        } catch (err) {
            setActionAlert({ type: "error", message: "Error updating status: " + (err instanceof Error ? err.message : String(err)) });
            setTimeout(() => setActionAlert(null), 3000);
        }
    };

    /* ─── Loading State ─── */
    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-500 font-medium tracking-wide text-sm">Loading dashboard...</p>
            </div>
        );
    }

    /* ─── Error State ─── */
    if (error) {
        return (
            <div className="w-full">
                <Alert type="error" message={`Failed to load dashboard: ${error}`} />
            </div>
        );
    }

    return (
        <div className="text-white w-full max-w-7xl mx-auto space-y-10">
            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-[28px] font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">Dashboard</h1>
                    <p className="text-zinc-500 text-sm font-[family-name:var(--font-body)]">Overview of project requests and activity metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">Live</span>
                    </div>
                </div>
            </div>

            {actionAlert && (
                <Alert type={actionAlert.type} message={actionAlert.message} />
            )}

            {/* ─── Statistic Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard
                    title="Total Submissions"
                    value={analytics?.total || 0}
                    icon={Folder}
                    iconColorClass="text-indigo-400"
                />
                <StatsCard
                    title="Pending"
                    value={analytics?.pending || 0}
                    icon={Clock}
                    colorClass="text-amber-400"
                    iconColorClass="text-amber-400"
                />
                <StatsCard
                    title="Approved"
                    value={analytics?.approved || 0}
                    icon={CheckCircle}
                    colorClass="text-emerald-400"
                    iconColorClass="text-emerald-400"
                />
                <StatsCard
                    title="Rejected"
                    value={analytics?.rejected || 0}
                    icon={XCircle}
                    colorClass="text-rose-400"
                    iconColorClass="text-rose-400"
                />
            </div>

            {/* ─── Analytics Charts ─── */}
            <DashboardAnalytics submissions={submissions} />

            {/* ─── Recent Submissions ─── */}
            <div className="space-y-4">
                <h2 className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase font-[family-name:var(--font-body)]">Recent Submissions</h2>
                <SubmissionsTable
                    submissions={submissions}
                    onUpdateStatus={handleUpdateStatus}
                    isDashboard={true}
                    hideSearchAndFilter={true}
                />
            </div>
        </div>
    );
}