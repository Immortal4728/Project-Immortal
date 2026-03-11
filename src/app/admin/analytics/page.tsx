"use client";

import React, { useState, useEffect } from "react";
import {
    Users, Briefcase, Activity,
    TrendingUp, LineChart as LineChartIcon,
    BarChart3, Loader2, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

interface AnalyticsData {
    users: {
        totalUsers: number;
        activeUsers: number;
        newUsersToday: number;
    };
    submissions: {
        totalSubmissions: number;
        submissionsToday: number;
        pendingReview: number;
        approvedSubmissions: number;
    };
    traffic: {
        dailyVisits: number;
        weeklyVisits: number;
        monthlyVisits: number;
    };
    charts: {
        dailySubmissions: { date: string; count: number }[];
        weeklyUsers: { week: string; count: number }[];
    };
    health: {
        apiStatus: string;
        databaseStatus: string;
        serverUptime: number;
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/admin/analytics");
            const result = await res.json();
            if (result.success) {
                setData(result.data);
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error("Fetch analytics error:", err);
            setError("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        if (d > 0) return `${d}d ${h}h ${m}m`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    if (loading && !data) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 w-full max-w-7xl mx-auto mt-12">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-rose-400 text-sm font-medium">{error}</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="text-white w-full max-w-7xl mx-auto space-y-8 font-[family-name:var(--font-body)]">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">Platform Analytics</h1>
                <p className="text-zinc-400 tracking-wide text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live metrics updating every 30s.
                </p>
            </div>

            {/* ─── Metric Cards ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. User Statistics */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <Users className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-wide">User Statistics</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Total Users</span>
                            <span className="text-2xl font-bold font-mono">{data.users.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Active Users</span>
                            <span className="text-lg font-semibold font-mono text-emerald-400">{data.users.activeUsers}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">New Users Today</span>
                            <span className="text-lg font-semibold font-mono text-indigo-400">+{data.users.newUsersToday}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Submission Metrics */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Briefcase className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-wide">Submissions</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Total Submissions</span>
                            <span className="text-2xl font-bold font-mono">{data.submissions.totalSubmissions}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Pending Review</span>
                            <span className="text-lg font-semibold font-mono text-amber-500">{data.submissions.pendingReview}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Approved</span>
                            <span className="text-lg font-semibold font-mono text-emerald-400">{data.submissions.approvedSubmissions}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Traffic / Platform Usage */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-wide">Platform Traffic</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Daily Visits</span>
                            <span className="text-2xl font-bold font-mono text-zinc-200">{data.traffic.dailyVisits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Weekly Visits</span>
                            <span className="text-lg font-semibold font-mono text-zinc-300">{data.traffic.weeklyVisits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-zinc-400">Monthly Visits</span>
                            <span className="text-lg font-semibold font-mono text-zinc-400">{data.traffic.monthlyVisits.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Charts Section ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Daily Submissions Line Chart */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-semibold tracking-wide flex items-center gap-2">
                                <LineChartIcon className="w-4 h-4 text-indigo-400" /> Daily Submissions
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Rolling 30 days of project request data</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.dailySubmissions} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" stroke="#ffffff30" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff30" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                                />
                                <Line type="monotone" dataKey="count" name="Submissions" stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#818cf8', stroke: '#111111', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Users Bar Chart */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-semibold tracking-wide flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" /> New User Registrations
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Rolling 4 weeks historical mapping</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.weeklyUsers} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="week" stroke="#ffffff30" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff30" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#34d399', fontWeight: 600 }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="count" name="New Users" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ─── System Health ─── */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold tracking-wide">System & Infrastructure Health</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg border ${data.health.apiStatus === 'Online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {data.health.apiStatus === 'Online' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">API Node</p>
                            <p className="text-sm font-semibold text-white">{data.health.apiStatus}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg border ${data.health.databaseStatus === 'Online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {data.health.databaseStatus === 'Online' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">InsForge DB</p>
                            <p className="text-sm font-semibold text-white">{data.health.databaseStatus}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Server Worker Uptime</p>
                            <p className="text-sm font-semibold text-white">{formatUptime(data.health.serverUptime)}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
