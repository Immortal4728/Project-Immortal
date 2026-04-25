"use client";

import { useEffect, useState } from "react";
import { Folder, Clock, CheckCircle, XCircle } from "lucide-react";
import Alert from "@/components/ui/alert";
import { StatsCard } from "@/components/admin/StatsCard";
import { SubmissionsTable, TableSubmission } from "@/components/admin/SubmissionsTable";
import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";
import { AdminDashboardSkeleton } from "@/components/ui/dashboard-skeletons";

type Analytics = {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
};

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
    const [actionAlert, setActionAlert] = useState<{ type: "success" | "error" | "info" | "warning", message: string } | null>(null);

    /* ─── Data Fetching ─── */
    const { data: dashboardRes, error: dashboardError, mutate: mutateDashboard } = useSWR("/api/admin/dashboard", fetcher);

    const dashboardData = dashboardRes?.success ? dashboardRes.data : null;
    
    const error = dashboardError || (dashboardRes && !dashboardRes.success ? dashboardRes.error : null);
    const loading = !dashboardRes && !dashboardError;

    const stats = dashboardData?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
    const recentSubmissions = dashboardData?.recentSubmissions || [];
    const domainDistribution = dashboardData?.domainDistribution || [];
    const statusDistribution = dashboardData?.statusDistribution || [];
    const timelineData = dashboardData?.timelineData || [];

    /* ─── Refresh data helper ─── */
    const refreshData = async () => {
        try {
            await mutateDashboard();
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
        return <AdminDashboardSkeleton />;
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
                    <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">Dashboard</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <StatsCard
                    title="Total Submissions"
                    value={stats.total}
                    icon={Folder}
                    iconColorClass="text-indigo-400"
                />
                <StatsCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    colorClass="text-amber-400"
                    iconColorClass="text-amber-400"
                />
                <StatsCard
                    title="Approved"
                    value={stats.approved}
                    icon={CheckCircle}
                    colorClass="text-emerald-400"
                    iconColorClass="text-emerald-400"
                />
                <StatsCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={XCircle}
                    colorClass="text-rose-400"
                    iconColorClass="text-rose-400"
                />
            </div>

            {/* ─── Analytics Charts ─── */}
            {/* Desktop version (hidden on mobile) */}
            <div className="hidden md:block">
                <DashboardAnalytics 
                    domainData={domainDistribution}
                    statusData={statusDistribution}
                    timelineData={timelineData}
                />
            </div>

            {/* ─── Recent Submissions ─── */}
            <div className="space-y-4">
                <h2 className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase font-[family-name:var(--font-body)]">Recent Submissions</h2>
                <SubmissionsTable
                    submissions={recentSubmissions}
                    onUpdateStatus={handleUpdateStatus}
                    isDashboard={true}
                    hideSearchAndFilter={true}
                />
            </div>
        </div>
    );
}