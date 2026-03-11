"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper, { Area } from "react-easy-crop";
import {
    FolderKanban,
    Clock,
    CheckCircle,
    XCircle,
    Download,
    Video,
    Calendar,
    Timer,
    ExternalLink,
    LogOut,
    FileText,
    ArrowLeft,
    Inbox,
    Tag,
    User,
    BookOpen,
    Package,
    Code2,
    PlayCircle,
    FileArchive,
    FileSpreadsheet,
    Presentation,
    ClipboardList,
    Database,
    Lightbulb,
    Layers,
    ChevronRight,
    Sparkles,
    Users,
    Camera,
    Loader2,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { LogoutModal } from "@/components/ui/logout-modal";
import { insforge } from "@/lib/insforge";

/* ─── Types ─── */
interface ProjectDocument {
    id: string;
    project_id: string;
    document_type: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
}

interface ProjectFile {
    id: string;
    project_id: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
}

interface Project {
    id: string;
    name: string;
    email: string;
    phone: string;
    project_title: string;
    domain: string;
    description: string;
    status: string;
    payment_status: string | null;
    meeting_link: string | null;
    meeting_date: string | null;
    meeting_time: string | null;
    created_at: string;
    updated_at: string;
    order_id: string | null;
    student_profile_photo?: string;
    progress_stage?: string;
    files: ProjectFile[];
}

/* ─── Crop Helpers ─── */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });
}

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size,
    );
    return canvas.toDataURL("image/png", 0.92);
}

/* ─── Progress Stage Config ─── */
const STAGES = [
    { key: "submitted", label: "Submitted" },
    { key: "review", label: "Review" },
    { key: "approved", label: "Approved" },
    { key: "development", label: "Development" },
    { key: "delivery", label: "Delivery" },
    { key: "completed", label: "Completed" },
];

function getStageIndex(status: string): number {
    const s = status?.toLowerCase() || "pending";
    const map: Record<string, number> = {
        pending: 0,
        submitted: 0,
        review: 1,
        "in review": 1,
        approved: 2,
        development: 3,
        "in development": 3,
        "in progress": 3,
        delivery: 4,
        delivered: 4,
        completed: 5,
        done: 5,
    };
    return map[s] ?? 0;
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase() || "pending";
    const config = {
        pending: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            text: "text-amber-400",
            icon: <Clock className="w-3.5 h-3.5" />,
            label: "Pending",
        },
        submitted: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            text: "text-blue-400",
            icon: <FileText className="w-3.5 h-3.5" />,
            label: "Submitted",
        },
        approved: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            text: "text-emerald-400",
            icon: <CheckCircle className="w-3.5 h-3.5" />,
            label: "Approved",
        },
        rejected: {
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            text: "text-rose-400",
            icon: <XCircle className="w-3.5 h-3.5" />,
            label: "Rejected",
        },
        development: {
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
            text: "text-violet-400",
            icon: <Code2 className="w-3.5 h-3.5" />,
            label: "In Development",
        },
        completed: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            text: "text-emerald-400",
            icon: <CheckCircle className="w-3.5 h-3.5" />,
            label: "Completed",
        },
    }[s] || {
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20",
        text: "text-zinc-400",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: status,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} border ${config.border} ${config.text} text-xs font-semibold tracking-wide`}>
            {config.icon}
            {config.label}
        </span>
    );
}

/* ─── Section Card ─── */
function SectionCard({
    title,
    icon: Icon,
    iconColor = "text-zinc-400",
    iconBg = "bg-zinc-800/70",
    children,
    className = "",
}: {
    title: string;
    icon: React.ElementType;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`group relative bg-zinc-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgb(0,0,0,0.4)] overflow-hidden font-[family-name:var(--font-body)] ${className}`}>
            {/* Subtle gradient glow on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-xl ${iconBg} border border-white/[0.04] ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-[11px] font-semibold text-zinc-500 tracking-[0.15em] uppercase">
                        {title}
                    </h2>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ─── Info Row ─── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-white/[0.04] last:border-0">
            <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase min-w-[140px] shrink-0">
                {label}
            </span>
            <span className="text-sm text-white">{value || <span className="text-zinc-600">—</span>}</span>
        </div>
    );
}

/* ─── Empty State ─── */
function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="p-4 bg-zinc-800/40 rounded-2xl border border-white/[0.04]">
                <Icon className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
                {message}
            </p>
        </div>
    );
}

/* ─── Progress Tracker ─── */
function ProgressTracker({ status }: { status: string }) {
    const currentIndex = getStageIndex(status);

    return (
        <div className="w-full">
            {/* Desktop Progress */}
            <div className="hidden md:flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-5 left-[calc(8.33%)] right-[calc(8.33%)] h-[2px] bg-zinc-800 rounded-full" />
                {/* Active line */}
                <div
                    className="absolute top-5 left-[calc(8.33%)] h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${(currentIndex / (STAGES.length - 1)) * (100 - 16.66)}%`,
                    }}
                />

                {STAGES.map((stage, i) => {
                    const isCompleted = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    const isFuture = i > currentIndex;

                    return (
                        <div key={stage.key} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted
                                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-400"
                                    : isCurrent
                                        ? "bg-violet-500/20 border-violet-500 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-110"
                                        : "bg-zinc-900 border-zinc-700 text-zinc-600"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : isCurrent ? (
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                ) : (
                                    <span className="text-[10px] font-bold">{i + 1}</span>
                                )}
                            </div>
                            <span
                                className={`mt-3 text-[10px] font-semibold tracking-wider uppercase transition-colors duration-300 ${isCompleted
                                    ? "text-indigo-400"
                                    : isCurrent
                                        ? "text-violet-300"
                                        : "text-zinc-600"
                                    }`}
                            >
                                {stage.label}
                            </span>
                            {isCurrent && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                    <ChevronRight className="w-3 h-3 text-violet-400 rotate-90 animate-bounce" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Progress */}
            <div className="md:hidden space-y-2">
                {STAGES.map((stage, i) => {
                    const isCompleted = i < currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                        <div key={stage.key} className="flex items-center gap-3">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${isCompleted
                                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-400"
                                    : isCurrent
                                        ? "bg-violet-500/20 border-violet-500 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                                        : "bg-zinc-900 border-zinc-700 text-zinc-600"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-3 h-3" />
                                ) : isCurrent ? (
                                    <Sparkles className="w-3 h-3" />
                                ) : (
                                    <span className="text-[9px] font-bold">{i + 1}</span>
                                )}
                            </div>
                            <span
                                className={`text-xs font-semibold tracking-wide ${isCompleted ? "text-indigo-400" : isCurrent ? "text-violet-300" : "text-zinc-600"
                                    }`}
                            >
                                {stage.label}
                            </span>
                            {isCurrent && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold">
                                    Current
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Material Card ─── */
// MaterialCard removed as it's no longer used


/* ────────────────────────────────────────────
   ─── Main Dashboard ───
   ──────────────────────────────────────────── */
export default function StudentDashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLogout, setShowLogout] = useState(false);

    // New state for Project Documents
    const [docsLoading, setDocsLoading] = useState(false);
    const [projectDocs, setProjectDocs] = useState<ProjectDocument[]>([]);

    // Profile photo upload states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [uploading, setUploading] = useState(false);

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setCropImage(reader.result as string);
            setCropModalOpen(true);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSaveCrop = async () => {
        if (!cropImage || !croppedAreaPixels) return;
        try {
            setUploading(true);
            const croppedBase64 = await getCroppedImg(cropImage, croppedAreaPixels);

            const res = await fetch("/api/student/profile/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: croppedBase64 }),
            });
            const data = await res.json();

            if (data.success) {
                setProjects((prev) =>
                    prev.map((p, idx) => idx === 0 ? { ...p, student_profile_photo: data.url } : p)
                );
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
            setCropModalOpen(false);
            setCropImage(null);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            fetchProjectDocs(projects[0].id);
        }
    }, [projects]);

    const fetchProjectDocs = async (projectId: string) => {
        try {
            setDocsLoading(true);
            const { data, error } = await insforge.database
                .from("project_files")
                .select("*")
                .eq("project_id", projectId);

            if (data && !error) {
                setProjectDocs(data);
            }
        } catch (err) {
            console.error("Error fetching project docs:", err);
        } finally {
            setDocsLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/student/session", {
                method: "GET",
                credentials: "include",
            });

            const data = await res.json();

            if (data && data.success) {
                setProjects(data.data);
            } else if (res.status === 401) {
                router.push("/student/login");
                return;
            } else {
                setError(data?.error || "Failed to load project data.");
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/";
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-indigo-500 animate-spin" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-violet-500/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-zinc-400 font-medium tracking-wide text-sm font-[family-name:var(--font-body)]">
                            Loading your project...
                        </p>
                        <p className="text-zinc-600 text-xs font-[family-name:var(--font-body)]">
                            Setting up your control center
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── Error ─── */
    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-zinc-900/70 border border-white/[0.06] rounded-2xl p-8 text-center space-y-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl inline-block">
                        <XCircle className="w-6 h-6 text-rose-500" />
                    </div>
                    <p className="text-rose-400 font-semibold text-sm">{error}</p>
                    <button
                        onClick={() => router.push("/student/login")}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 mx-auto"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    const project = projects[0];

    /* ─── Project Documentation Types ─── */
    const DOCUMENT_TYPES = [
        { key: "record", type: "Project Record", icon: ClipboardList, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10" },
        { key: "ppt", type: "PPT Presentation", icon: Presentation, colorClass: "text-pink-400", bgClass: "bg-pink-500/10" },
        { key: "viva", type: "Viva Questions", icon: FileText, colorClass: "text-amber-400", bgClass: "bg-amber-500/10" },
        { key: "notes", type: "Internal Notes", icon: BookOpen, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-heading)]">
            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
                <div className="absolute -bottom-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/[0.03] blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto p-5 md:p-10 lg:p-14 space-y-8">

                {/* ═══════════════════════════════════════════
                    § 1 — Student Profile Header
                   ═══════════════════════════════════════════ */}
                <div className="animate-element bg-zinc-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8 transition-all duration-500 hover:border-white/[0.1]">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-[2px] ring-white/[0.08] ring-offset-[#050505] ring-offset-[4px] group-hover/avatar:ring-indigo-500/50 transition-all duration-300">
                                {project?.student_profile_photo ? (
                                    <img
                                        src={project.student_profile_photo}
                                        alt={project.name}
                                        className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <span>{project?.name?.charAt(0)?.toUpperCase() || "S"}</span>
                                )}

                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5 text-white mb-0.5" />
                                            <span className="text-[8px] font-bold tracking-widest text-white/80 uppercase">
                                                Update
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-[#050505] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                                <span className="w-2 h-2 rounded-full bg-white" />
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileSelected}
                        />

                        {/* Identity Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                    {project?.name || "Student"}
                                </h1>
                                <p className="text-zinc-400 text-sm font-[family-name:var(--font-body)] mt-1 flex items-center gap-2">
                                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-zinc-300 font-medium">{project?.project_title || "—"}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {project?.domain && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold tracking-wide">
                                        <Layers className="w-3 h-3" />
                                        {project.domain}
                                    </span>
                                )}
                                <StatusBadge status={project?.status || "pending"} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                            <button
                                onClick={() => setShowLogout(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/70 border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-zinc-800 transition-all text-xs font-semibold tracking-wide font-[family-name:var(--font-body)]"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    § 2 — Project Progress Tracker
                   ═══════════════════════════════════════════ */}
                <div className="animate-element animate-delay-100 bg-zinc-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-white/[0.04] text-violet-400">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h2 className="text-[11px] font-semibold text-zinc-500 tracking-[0.15em] uppercase">
                            Project Progress
                        </h2>
                    </div>
                    {(() => { console.log("Current progress stage:", project?.progress_stage); return null; })()}
                    <ProgressTracker status={project?.progress_stage || project?.status || "pending"} />
                </div>

                {/* ═══════════════════════════════════════════
                    § 3 & 7 — Project Overview + Meeting (2-col)
                   ═══════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-element animate-delay-200">
                    {/* Project Overview — 3 cols */}
                    <SectionCard
                        title="Project Overview"
                        icon={FolderKanban}
                        iconColor="text-indigo-400"
                        iconBg="bg-indigo-500/10"
                        className="lg:col-span-3"
                    >
                        <InfoRow label="Project Title" value={project?.project_title} />
                        <InfoRow label="Domain" value={
                            project?.domain ? (
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                                    {project.domain}
                                </span>
                            ) : null
                        } />
                        <InfoRow label="Submitted On" value={formatDate(project?.created_at)} />
                        <InfoRow label="Order ID" value={
                            project?.order_id ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-white/[0.06] text-zinc-200 text-xs font-mono font-semibold tracking-wider">
                                    <Tag className="w-3 h-3 text-zinc-500" />
                                    {project.order_id}
                                </span>
                            ) : null
                        } />
                        <InfoRow label="Description" value={
                            <p className="text-zinc-300 text-sm leading-relaxed">{project?.description}</p>
                        } />
                    </SectionCard>

                    {/* Meeting Info — 2 cols */}
                    <SectionCard
                        title="Meeting"
                        icon={Video}
                        iconColor="text-sky-400"
                        iconBg="bg-sky-500/10"
                        className="lg:col-span-2"
                    >
                        {project?.meeting_link || project?.meeting_date ? (
                            <div className="space-y-4">
                                {/* Mentor */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 border border-white/[0.04]">
                                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Mentor</p>
                                        <p className="text-sm text-white font-medium">Assigned Mentor</p>
                                    </div>
                                </div>

                                {project.meeting_date && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Date</p>
                                            <p className="text-sm text-white">{project.meeting_date}</p>
                                        </div>
                                    </div>
                                )}
                                {project.meeting_time && (
                                    <div className="flex items-center gap-3">
                                        <Timer className="w-4 h-4 text-sky-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Time</p>
                                            <p className="text-sm text-white">{project.meeting_time}</p>
                                        </div>
                                    </div>
                                )}
                                {project.meeting_link && (
                                    <a
                                        href={project.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/30 transition-all text-sm font-semibold"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Join Meeting
                                    </a>
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Video}
                                message="No meeting scheduled yet. You'll see details here once a mentorship session is set up."
                            />
                        )}
                    </SectionCard>
                </div>

                {/* ═══════════════════════════════════════════
                    § 4 — Project Documentation (Replaced old panels)
                   ═══════════════════════════════════════════ */}
                <div className="animate-element animate-delay-300">
                    <SectionCard
                        title="Project Documentation"
                        icon={BookOpen}
                        iconColor="text-blue-400"
                        iconBg="bg-blue-500/10"
                    >
                        {docsLoading ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-white/[0.04]">
                                            <th className="pb-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-[family-name:var(--font-body)]">Document Type</th>
                                            <th className="pb-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-[family-name:var(--font-body)]">Status</th>
                                            <th className="pb-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-[family-name:var(--font-body)]">File Name</th>
                                            <th className="pb-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-[family-name:var(--font-body)] text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {DOCUMENT_TYPES.map(({ key, type, icon: Icon, colorClass, bgClass }) => {
                                            const doc = projectDocs.find(d => d.document_type === key);
                                            const isAvailable = !!doc;

                                            // Handle long file names
                                            const displayFileName = doc?.file_name
                                                ? (doc.file_name.length > 30 ? doc.file_name.substring(0, 27) + '...' : doc.file_name)
                                                : "—";

                                            return (
                                                <tr key={type} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-medium text-white">{type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        {isAvailable ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Uploaded ✓
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-white/[0.06] text-zinc-400 text-[11px] font-semibold">
                                                                Not Available
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <span className="text-sm text-zinc-400 font-mono text-xs" title={doc?.file_name}>
                                                            {displayFileName}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 font-[family-name:var(--font-body)] text-right">
                                                        <a
                                                            href={isAvailable ? doc.file_url : undefined}
                                                            target={isAvailable ? "_blank" : undefined}
                                                            rel={isAvailable ? "noopener noreferrer" : undefined}
                                                            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold overflow-hidden relative transition-all duration-300 ${isAvailable
                                                                ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white border border-violet-500/20 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
                                                                : "bg-zinc-800/50 text-zinc-500 border border-white/[0.04] cursor-not-allowed opacity-50"
                                                                }`}
                                                            onClick={(e) => {
                                                                if (!isAvailable) e.preventDefault();
                                                            }}
                                                        >
                                                            Open
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* ═══════════════════════════════════════════
                    § 6 — Project Deliverables
                   ═══════════════════════════════════════════ */}
                <div className="animate-element animate-delay-400">
                    <SectionCard
                        title="Project Deliverables"
                        icon={Download}
                        iconColor="text-violet-400"
                        iconBg="bg-violet-500/10"
                    >
                        {project?.files && project.files.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {project.files.map((file) => {
                                    const ext = file.file_name?.split(".").pop()?.toLowerCase() || "";
                                    let FileIcon = FileText;
                                    let fColor = "text-violet-400";
                                    let fBg = "bg-violet-500/10";

                                    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
                                        FileIcon = FileArchive;
                                        fColor = "text-orange-400";
                                        fBg = "bg-orange-500/10";
                                    } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
                                        FileIcon = PlayCircle;
                                        fColor = "text-rose-400";
                                        fBg = "bg-rose-500/10";
                                    } else if (["js", "ts", "py", "java", "cpp", "c", "html", "css"].includes(ext)) {
                                        FileIcon = Code2;
                                        fColor = "text-emerald-400";
                                        fBg = "bg-emerald-500/10";
                                    } else if (["pdf"].includes(ext)) {
                                        FileIcon = FileText;
                                        fColor = "text-red-400";
                                        fBg = "bg-red-500/10";
                                    }

                                    return (
                                        <a
                                            key={file.id}
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-white/[0.04] hover:border-violet-500/20 hover:bg-zinc-800/60 transition-all duration-300 group/file"
                                        >
                                            <div className={`p-2.5 rounded-xl ${fBg} ${fColor} group-hover/file:scale-110 transition-transform duration-300`}>
                                                <FileIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium truncate">{file.file_name}</p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                                    {formatDate(file.uploaded_at)}
                                                </p>
                                            </div>
                                            <Download className="w-4 h-4 text-zinc-600 group-hover/file:text-violet-400 transition-colors shrink-0" />
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Inbox}
                                message="No deliverables available yet. Files will appear here once your project deliverables are ready."
                            />
                        )}
                    </SectionCard>
                </div>

                {/* ─── Multiple Projects Indicator ─── */}
                {projects.length > 1 && (
                    <div className="bg-zinc-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 animate-element animate-delay-500">
                        <p className="text-xs text-zinc-500 font-[family-name:var(--font-body)] flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-zinc-600" />
                            You have <span className="text-white font-semibold">{projects.length}</span> project submissions.
                            Showing the most recent one above.
                        </p>
                    </div>
                )}

                {/* ─── Footer ─── */}
                <div className="text-center pt-4 pb-8 border-t border-white/[0.04]">
                    <p className="text-[11px] text-zinc-600 font-[family-name:var(--font-body)]">
                        Project Immortal © {new Date().getFullYear()} — Student Portal
                    </p>
                </div>
            </div>

            <LogoutModal
                isOpen={showLogout}
                onClose={() => setShowLogout(false)}
                onConfirm={handleConfirmLogout}
            />

            {/* ════════════════════════════════════════════
                CROP MODAL
               ════════════════════════════════════════════ */}
            {cropModalOpen && cropImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center font-[family-name:var(--font-body)]">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => { setCropModalOpen(false); setCropImage(null); }}
                    />
                    <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] w-[90vw] max-w-[480px] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                            <div>
                                <h3 className="text-base font-bold text-white tracking-tight">Crop Profile Photo</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Drag to reposition, scroll to zoom</p>
                            </div>
                            <button
                                onClick={() => { setCropModalOpen(false); setCropImage(null); }}
                                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Crop Area */}
                        <div className="relative w-full h-[340px] bg-black">
                            <Cropper
                                image={cropImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                style={{
                                    containerStyle: { background: "#0a0a0a" },
                                    cropAreaStyle: {
                                        border: "2px solid rgba(139, 92, 246, 0.5)",
                                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
                                    },
                                }}
                            />
                        </div>
                        {/* Zoom */}
                        <div className="px-6 py-4 border-t border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 rounded-full appearance-none bg-zinc-800 accent-violet-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.4)] [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                                <ZoomIn className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="px-6 py-5 border-t border-white/[0.06] flex items-center justify-end gap-3">
                            <button
                                onClick={() => { setCropModalOpen(false); setCropImage(null); }}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCrop}
                                disabled={uploading}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 flex items-center gap-2"
                            >
                                {uploading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                                ) : (
                                    "Save Photo"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
