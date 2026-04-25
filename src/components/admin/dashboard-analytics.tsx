"use client";

import React, { useMemo } from "react";
import { TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";

interface DashboardAnalyticsProps {
    domainData: Array<{ name: string; value: number }>;
    statusData: Array<{ name: string; value: number }>;
    timelineData: Array<{ date: string; submissions: number }>;
}

/* ─── Color Palettes ─── */
const DOMAIN_COLORS: Record<string, string> = {
    "AI / Machine Learning": "#8b5cf6",
    "Mobile Application": "#3b82f6",
    "Fullstack Web Application": "#10b981",
    "Other": "#f59e0b",
};
const DOMAIN_FALLBACKS = ["#6366f1", "#ec4899", "#06b6d4", "#f97316", "#84cc16"];

const STATUS_COLORS: Record<string, string> = {
    Pending: "#f59e0b",
    Approved: "#10b981",
    Rejected: "#ef4444",
};

/* ─── Tooltip Components (declared outside render) ─── */
const DomainTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }> }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-950/95 border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0]?.payload?.fill }} />
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{payload[0]?.name}</p>
            </div>
            <p className="text-base font-bold text-white tracking-tight">{payload[0]?.value} {payload[0]?.value === 1 ? "project" : "projects"}</p>
        </div>
    );
};

const StatusTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }> }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-950/95 border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0]?.payload?.fill }} />
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{payload[0]?.name}</p>
            </div>
            <p className="text-base font-bold text-white tracking-tight">{payload[0]?.value} {payload[0]?.value === 1 ? "submission" : "submissions"}</p>
        </div>
    );
};

const ActivityTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-950/95 border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-md">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-base font-bold text-white tracking-tight">{payload[0]?.value} {payload[0]?.value === 1 ? "submission" : "submissions"}</p>
        </div>
    );
};

/* ─── Custom Legend ─── */
const ChartLegend = ({ items }: { items: Array<{ name: string; value: number; color: string }> }) => (
    <div className="flex flex-col gap-2.5 min-w-[130px] max-w-[170px] pl-2">
        {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 group cursor-default">
                <div className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-[11px] text-zinc-400 font-medium truncate group-hover:text-zinc-200 transition-colors">{item.name}</span>
                    <span className="text-[11px] text-zinc-600 font-semibold tabular-nums ml-2">{item.value}</span>
                </div>
            </div>
        ))}
    </div>
);

/* ─── Chart Card Wrapper ─── */
const ChartCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`group bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_8px_40px_rgb(0,0,0,0.3)] ${className}`}>
        {children}
    </div>
);

/* ─── Main Component ─── */
export function DashboardAnalytics({ domainData: rawDomainData, statusData: rawStatusData, timelineData }: DashboardAnalyticsProps) {
    // Map colors to the incoming data
    const domainData = useMemo(() => {
        return rawDomainData.map((d, i) => ({
            ...d,
            fill: DOMAIN_COLORS[d.name] || DOMAIN_FALLBACKS[i % DOMAIN_FALLBACKS.length]
        }));
    }, [rawDomainData]);

    const statusData = useMemo(() => {
        return rawStatusData.map(d => ({
            ...d,
            fill: STATUS_COLORS[d.name] || "#6b7280"
        }));
    }, [rawStatusData]);

    if (!rawDomainData.length && !rawStatusData.length && !timelineData.length) return null;

    return (
        <div className="space-y-6 mt-8">
            {/* Two-column Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Domain Distribution Pie Chart */}
                <ChartCard>
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15">
                            <PieChartIcon className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">Domain Distribution</h3>
                            <p className="text-[10px] text-zinc-600">Submissions by project domain</p>
                        </div>
                    </div>
                    <div className="flex items-center w-full">
                        {domainData.length > 0 ? (
                            <div className="flex items-center w-full gap-2">
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={domainData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={105}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {domainData.map((entry, index) => (
                                                    <Cell key={`domain-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<DomainTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <ChartLegend items={domainData.map(d => ({ name: d.name, value: d.value, color: d.fill }))} />
                            </div>
                        ) : (
                            <div className="w-full h-[300px] flex items-center justify-center">
                                <p className="text-zinc-600 text-sm">No domain data yet</p>
                            </div>
                        )}
                    </div>
                </ChartCard>

                {/* Status Distribution Pie Chart */}
                <ChartCard>
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">Status Distribution</h3>
                            <p className="text-[10px] text-zinc-600">Pending, approved, and rejected</p>
                        </div>
                    </div>
                    <div className="flex items-center w-full">
                        {statusData.length > 0 ? (
                            <div className="flex items-center w-full gap-2">
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={105}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`status-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<StatusTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <ChartLegend items={statusData.map(d => ({ name: d.name, value: d.value, color: d.fill }))} />
                            </div>
                        ) : (
                            <div className="w-full h-[300px] flex items-center justify-center">
                                <p className="text-zinc-600 text-sm">No status data yet</p>
                            </div>
                        )}
                    </div>
                </ChartCard>
            </div>

            {/* Daily Submission Activity — Line/Area Chart (full width) */}
            <ChartCard>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">Daily Submission Activity</h3>
                            <p className="text-[10px] text-zinc-600">Submissions received per day</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-white/[0.04]">
                        <div className="w-2 h-0.5 rounded-full bg-indigo-400" />
                        <span className="text-[10px] text-zinc-500 font-medium">Submissions</span>
                    </div>
                </div>
                {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timelineData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="none"
                                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="none"
                                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={<ActivityTooltip />}
                                cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="submissions"
                                name="Submissions"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                fill="url(#areaGradient)"
                                dot={{ r: 3.5, fill: "#6366f1", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#818cf8", strokeWidth: 2, stroke: "#312e81" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-[300px] flex items-center justify-center">
                        <p className="text-zinc-600 text-sm">No activity data yet</p>
                    </div>
                )}
            </ChartCard>
        </div>
    );
}
