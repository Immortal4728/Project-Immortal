"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
    LogOut,
    Search,
    AlertCircle,
    FolderOpen,
    FileCheck,
    FileX,
    Sparkles,
} from "lucide-react";
import { LogoutModal } from "@/components/ui/logout-modal";
import { EmployeeDashboardSkeleton } from "@/components/ui/dashboard-skeletons";

interface ProjectFile {
    id: string;
    document_type: string;
}

interface ApprovedProject {
    id: string;
    name: string;
    email: string;
    project_title: string;
    domain: string;
    status: string;
    order_id: string;
    created_at: string;
    files?: ProjectFile[];
}

const DOC_TYPES = ["record", "ppt", "viva", "notes"];
const DOC_LABELS: Record<string, string> = {
    record: "Project Record",
    ppt: "PPT Presentation",
    viva: "Viva Questions",
    notes: "Internal Notes",
};

function getDocProgress(files: ProjectFile[] = []) {
    const uploaded = new Set(files.map((f) => f.document_type));
    return DOC_TYPES.map((type) => ({
        type,
        label: DOC_LABELS[type],
        done: uploaded.has(type),
    }));
}

function getDomainColor(domain: string) {
    const d = domain?.toLowerCase() || "";
    if (d.includes("ai") || d.includes("machine"))
        return { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "#a78bfa" };
    if (d.includes("web") || d.includes("full"))
        return { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", text: "#60a5fa" };
    if (d.includes("mobile") || d.includes("app"))
        return { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.25)", text: "#f472b6" };
    if (d.includes("data") || d.includes("analy"))
        return { bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.25)", text: "#38bdf8" };
    if (d.includes("cyber") || d.includes("secur"))
        return { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.25)", text: "#facc15" };
    return { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "#a78bfa" };
}

function getStatusColor(status: string) {
    const s = status?.toLowerCase() || "";
    if (s === "approved") return { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", text: "#4ade80" };
    if (s === "in_progress" || s === "in progress") return { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: "#60a5fa" };
    if (s === "completed") return { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", text: "#a78bfa" };
    return { bg: "rgba(161,161,170,0.1)", border: "rgba(161,161,170,0.2)", text: "#a1a1aa" };
}

const fetcher = (url: string) => fetch(url).then(async (res) => {
    const data = await res.json();
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!data.success) throw new Error(data.error || "Failed to fetch");
    return data.data as ApprovedProject[];
});

export default function EmployeeDashboard() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [showLogout, setShowLogout] = useState(false);

    const { data: projects, error, isLoading } = useSWR(
        "/api/employee/projects",
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            onError: (err) => {
                if (err.message === "UNAUTHORIZED") {
                    router.push("/employee/login");
                }
            },
        }
    );

    const handleConfirmLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/";
    };

    const filteredProjects = (projects || []).filter(
        (p) =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && !projects) {
        return <EmployeeDashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-heading)]">
            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-purple-600/[0.03] blur-[100px]" />
            </div>

            <div className="relative w-full max-w-7xl mx-auto p-6 md:p-10 lg:p-12 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                            <p className="text-[11px] font-semibold text-violet-400/80 tracking-[0.2em] uppercase font-[family-name:var(--font-body)]">
                                Documentation Workspace
                            </p>
                        </div>
                        <h1 className="text-3xl md:text-[34px] font-bold tracking-tight text-white">
                            My Projects
                        </h1>
                        <p className="text-zinc-500 text-sm font-[family-name:var(--font-body)] max-w-md">
                            Manage documentation and records for your assigned projects.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLogout(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 text-xs font-semibold tracking-wide self-start sm:self-auto font-[family-name:var(--font-body)]"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>

                {error && error.message !== "UNAUTHORIZED" && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-rose-400 text-sm font-medium font-[family-name:var(--font-body)]">
                            {error.message}
                        </span>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                    <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl px-5 py-4 focus-within:border-violet-500/30 transition-all duration-300">
                        <Search className="w-4.5 h-4.5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by student name, project title, or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-sm text-white placeholder-zinc-600 focus:outline-none w-full font-[family-name:var(--font-body)]"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-zinc-500 hover:text-white transition-colors text-xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Project count */}
                <div className="flex items-center gap-2 font-[family-name:var(--font-body)]">
                    <Sparkles className="w-4 h-4 text-violet-400/60" />
                    <span className="text-xs text-zinc-500 font-medium">
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} assigned
                    </span>
                </div>

                {/* Project Cards Grid */}
                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredProjects.map((project, index) => {
                            const domainColor = getDomainColor(project.domain);
                            const statusColor = getStatusColor(project.status);
                            const docProgress = getDocProgress(project.files);
                            const completedDocs = docProgress.filter((d) => d.done).length;

                            return (
                                <div
                                    key={project.id}
                                    className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-violet-500/20 hover:bg-white/[0.04] hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.15)]"
                                    style={{
                                        animationDelay: `${index * 80}ms`,
                                        animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                                        opacity: 0,
                                    }}
                                >
                                    {/* Card gradient accent top line */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Top Section */}
                                    <div className="p-6 pb-4 space-y-4">
                                        {/* Student Name & Badges Row */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] text-zinc-500 uppercase tracking-[0.15em] font-semibold mb-1 font-[family-name:var(--font-body)]">
                                                    Student
                                                </p>
                                                <h3 className="text-[15px] font-semibold text-white truncate">
                                                    {project.name}
                                                </h3>
                                            </div>
                                            <span
                                                className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                                style={{
                                                    background: statusColor.bg,
                                                    border: `1px solid ${statusColor.border}`,
                                                    color: statusColor.text,
                                                }}
                                            >
                                                {project.status}
                                            </span>
                                        </div>

                                        {/* Project Title */}
                                        <div>
                                            <p className="text-[13px] text-zinc-300 font-medium leading-relaxed line-clamp-2 font-[family-name:var(--font-body)]">
                                                {project.project_title || "Untitled Project"}
                                            </p>
                                        </div>

                                        {/* Domain Badge */}
                                        <div>
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                                style={{
                                                    background: domainColor.bg,
                                                    border: `1px solid ${domainColor.border}`,
                                                    color: domainColor.text,
                                                }}
                                            >
                                                {project.domain || "General"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Section — Document Progress */}
                                    <div className="px-6 py-4 border-t border-white/[0.04]">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.12em] font-semibold font-[family-name:var(--font-body)]">
                                                Document Progress
                                            </p>
                                            <span className="text-[11px] text-zinc-600 font-medium font-[family-name:var(--font-body)]">
                                                {completedDocs}/{DOC_TYPES.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {docProgress.map((doc) => (
                                                <div
                                                    key={doc.type}
                                                    className="flex items-center gap-2.5"
                                                >
                                                    {doc.done ? (
                                                        <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                    ) : (
                                                        <FileX className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                                    )}
                                                    <span
                                                        className={`text-xs font-medium font-[family-name:var(--font-body)] ${doc.done
                                                                ? "text-zinc-300"
                                                                : "text-zinc-600"
                                                            }`}
                                                    >
                                                        {doc.label}
                                                    </span>
                                                    <span className="text-[10px] ml-auto font-semibold">
                                                        {doc.done ? (
                                                            <span className="text-emerald-400">✓</span>
                                                        ) : (
                                                            <span className="text-zinc-700">✕</span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Section — Open Workspace Button */}
                                    <div className="px-6 py-4 border-t border-white/[0.04]">
                                        <button
                                            onClick={() =>
                                                router.push(`/employee/project/${project.id}`)
                                            }
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-300 hover:bg-violet-600/20 hover:text-violet-200 hover:border-violet-500/30 hover:shadow-[0_0_20px_-8px_rgba(139,92,246,0.3)] transition-all duration-300 text-xs font-semibold tracking-wide font-[family-name:var(--font-body)]"
                                        >
                                            <FolderOpen className="w-4 h-4" />
                                            Open Workspace
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                            <FolderOpen className="w-7 h-7 text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium font-[family-name:var(--font-body)]">
                            {searchTerm
                                ? "No projects match your search."
                                : "No assigned projects yet."}
                        </p>
                    </div>
                )}
            </div>

            <LogoutModal
                isOpen={showLogout}
                onClose={() => setShowLogout(false)}
                onConfirm={handleConfirmLogout}
            />
        </div>
    );
}
