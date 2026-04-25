"use client";

import React from "react";

/* ─── Base Skeleton Pulse ─── */
function Pulse({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
    );
}

/* ─── Admin Dashboard Skeleton ─── */
export function AdminDashboardSkeleton() {
    return (
        <div className="text-white w-full max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <Pulse className="h-8 w-40" />
                <Pulse className="h-4 w-64" />
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 space-y-3">
                        <Pulse className="h-4 w-24" />
                        <Pulse className="h-8 w-16" />
                    </div>
                ))}
            </div>
            {/* Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-6">
                    <Pulse className="h-4 w-32 mb-4" />
                    <Pulse className="h-48 w-full" />
                </div>
                <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-6">
                    <Pulse className="h-4 w-32 mb-4" />
                    <Pulse className="h-48 w-full" />
                </div>
            </div>
            {/* Table */}
            <div className="space-y-4">
                <Pulse className="h-4 w-40" />
                <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Pulse key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Student Dashboard Skeleton ─── */
export function StudentDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-body)]">
            <div className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-6">
                {/* Profile Header */}
                <div className="bg-[#111111] border border-white/5 rounded-xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <Pulse className="w-20 h-20 md:w-24 md:h-24 rounded-full shrink-0" />
                        <div className="flex-1 space-y-3">
                            <Pulse className="h-7 w-48" />
                            <Pulse className="h-4 w-64" />
                            <div className="flex gap-3 mt-2">
                                <Pulse className="h-6 w-20 rounded-md" />
                                <Pulse className="h-6 w-24 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Progress Tracker */}
                <div className="bg-[#111111] border border-white/5 rounded-xl p-6 md:p-8">
                    <Pulse className="h-5 w-36 mb-6" />
                    <div className="flex items-center gap-3">
                        {[...Array(5)].map((_, i) => (
                            <React.Fragment key={i}>
                                <Pulse className="w-8 h-8 rounded-full" />
                                {i < 4 && <Pulse className="h-1 flex-1" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4">
                            <Pulse className="h-5 w-32" />
                            <Pulse className="h-4 w-full" />
                            <Pulse className="h-4 w-3/4" />
                            <Pulse className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
                {/* Docs Table */}
                <div className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4">
                    <Pulse className="h-5 w-44" />
                    {[...Array(4)].map((_, i) => (
                        <Pulse key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Employee Dashboard Skeleton ─── */
export function EmployeeDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-heading)]">
            <div className="relative w-full max-w-7xl mx-auto p-6 md:p-10 lg:p-12 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <Pulse className="h-3 w-40" />
                    <Pulse className="h-9 w-48" />
                    <Pulse className="h-4 w-72" />
                </div>
                {/* Search Bar */}
                <Pulse className="h-14 w-full rounded-2xl" />
                {/* Count */}
                <Pulse className="h-4 w-32" />
                {/* Project Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <Pulse className="h-3 w-14" />
                                    <Pulse className="h-5 w-32" />
                                </div>
                                <Pulse className="h-6 w-16 rounded-lg" />
                            </div>
                            <Pulse className="h-4 w-full" />
                            <Pulse className="h-6 w-24 rounded-lg" />
                            <div className="border-t border-white/[0.04] pt-4 space-y-2">
                                <Pulse className="h-3 w-32" />
                                {[...Array(4)].map((_, j) => (
                                    <Pulse key={j} className="h-4 w-full" />
                                ))}
                            </div>
                            <div className="border-t border-white/[0.04] pt-4">
                                <Pulse className="h-10 w-full rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
