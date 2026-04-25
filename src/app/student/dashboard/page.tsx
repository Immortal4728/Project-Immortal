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
import { StudentDashboardSkeleton } from "@/components/ui/dashboard-skeletons";

/* ─── Types ─── */

interface ProjectFile {
    id: string;
    project_id: string;
    document_type?: string;
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
            bg: "bg-zinc-800",
            text: "text-zinc-300",
            icon: <Clock className="w-3.5 h-3.5" />,
            label: "Pending",
        },
        submitted: {
            bg: "bg-blue-500/10",
            text: "text-blue-500",
            icon: <FileText className="w-3.5 h-3.5" />,
            label: "Submitted",
        },
        approved: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-500",
            icon: <CheckCircle className="w-3.5 h-3.5" />,
            label: "Approved",
        },
        rejected: {
            bg: "bg-rose-500/10",
            text: "text-rose-500",
            icon: <XCircle className="w-3.5 h-3.5" />,
            label: "Rejected",
        },
        development: {
            bg: "bg-indigo-500/10",
            text: "text-indigo-500",
            icon: <Code2 className="w-3.5 h-3.5" />,
            label: "In Development",
        },
        completed: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-500",
            icon: <CheckCircle className="w-3.5 h-3.5" />,
            label: "Completed",
        },
    }[s] || {
        bg: "bg-zinc-800",
        text: "text-zinc-400",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: status,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bg} ${config.text} text-xs font-medium`}>
            {config.icon}
            {config.label}
        </span>
    );
}

/* ─── Section Card ─── */
function SectionCard({
    title,
    icon: Icon,
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
        <div className={`bg-[#111111] border border-white/5 rounded-xl p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-6">
                <Icon className="w-5 h-5 text-zinc-400" />
                <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
            </div>
            {children}
        </div>
    );
}

/* ─── Info Row ─── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-white/[0.04] last:border-0">
            <span className="text-sm font-medium text-zinc-400 min-w-[140px] shrink-0">
                {label}
            </span>
            <span className="text-sm text-zinc-100">{value || <span className="text-zinc-600">—</span>}</span>
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
                <div className="absolute top-4 left-[calc(8.33%)] right-[calc(8.33%)] h-[2px] bg-white/5 rounded-full" />
                {/* Active line */}
                <div
                    className="absolute top-4 left-[calc(8.33%)] h-[2px] bg-emerald-500 rounded-full"
                    style={{
                        width: `${(currentIndex / (STAGES.length - 1)) * (100 - 16.66)}%`,
                    }}
                />

                {STAGES.map((stage, i) => {
                    const isCompleted = i < currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                        <div key={stage.key} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-[2px] ${isCompleted
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                    : isCurrent
                                        ? "bg-[#111111] border-white text-white"
                                        : "bg-[#111111] border-white/10 text-zinc-500"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : isCurrent ? (
                                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                ) : (
                                    <span className="text-xs font-semibold">{i + 1}</span>
                                )}
                            </div>
                            <span
                                className={`mt-3 text-sm font-medium ${isCompleted || isCurrent
                                    ? "text-zinc-100"
                                    : "text-zinc-500"
                                    }`}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Progress */}
            <div className="md:hidden space-y-3">
                {STAGES.map((stage, i) => {
                    const isCompleted = i < currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                        <div key={stage.key} className="flex items-center gap-3">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${isCompleted
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                    : isCurrent
                                        ? "bg-transparent border-white text-white"
                                        : "bg-transparent border-white/10 text-zinc-500"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-3 h-3" />
                                ) : isCurrent ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                ) : (
                                    <span className="text-[10px] font-semibold">{i + 1}</span>
                                )}
                            </div>
                            <span
                                className={`text-sm font-medium ${isCompleted || isCurrent ? "text-zinc-100" : "text-zinc-500"
                                    }`}
                            >
                                {stage.label}
                            </span>
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

    // Ref guard to prevent React Strict Mode double-fetch
    const hasFetched = useRef(false);

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
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchProjects();
    }, []);

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
        return <StudentDashboardSkeleton />;
    }

    /* ─── Error ─── */
    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-[family-name:var(--font-body)]">
                <div className="max-w-md w-full bg-[#111111] border border-white/5 rounded-xl p-8 text-center space-y-4">
                    <div className="p-3 bg-rose-500/10 rounded-full inline-flex">
                        <XCircle className="w-6 h-6 text-rose-500" />
                    </div>
                    <p className="text-zinc-200 font-medium text-sm">{error}</p>
                    <button
                        onClick={() => router.push("/student/login")}
                        className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    const project = projects[0];

    /* ─── Project Documentation Types ─── */
    const DOCUMENT_TYPES = [
        { key: "record", type: "Project Record", icon: ClipboardList },
        { key: "ppt", type: "PPT Presentation", icon: Presentation },
        { key: "viva", type: "Viva Questions", icon: FileText },
        { key: "notes", type: "Internal Notes", icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-body)]">
            <div className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-6">

                {/* ═══════════════════════════════════════════
                    § 1 — Student Profile Header
                   ═══════════════════════════════════════════ */}
                <div className="bg-[#111111] border border-white/5 rounded-xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-zinc-300 text-2xl md:text-3xl font-bold border border-white/10">
                                {project?.student_profile_photo ? (
                                    <img
                                        src={project.student_profile_photo}
                                        alt={project.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{project?.name?.charAt(0)?.toUpperCase() || "S"}</span>
                                )}

                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <span className="text-xs font-medium text-white">Update</span>
                                    )}
                                </div>
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
                        <div className="flex-1 min-w-0 space-y-1">
                            <h1 className="text-xl md:text-2xl font-semibold text-zinc-100">
                                {project?.name || "Student"}
                            </h1>
                            <p className="text-zinc-400 text-sm flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-zinc-500" />
                                <span>{project?.project_title || "—"}</span>
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                                {project?.domain && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium">
                                        {project.domain}
                                    </span>
                                )}
                                <StatusBadge status={project?.status || "pending"} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0 self-start md:self-center w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={() => setShowLogout(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors w-full md:w-auto"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    § 2 — Project Progress Tracker
                   ═══════════════════════════════════════════ */}
                <div className="bg-[#111111] border border-white/5 rounded-xl p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-8">
                        <h2 className="text-base font-semibold text-zinc-100">
                            Project Progress
                        </h2>
                    </div>
                    <ProgressTracker status={project?.progress_stage || project?.status || "pending"} />
                </div>

                {/* ═══════════════════════════════════════════
                    § 3 & 7 — Project Overview + Meeting (2-col)
                   ═══════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Project Overview — 3 cols */}
                    <SectionCard
                        title="Project Overview"
                        icon={FolderKanban}
                        className="lg:col-span-3"
                    >
                        <InfoRow label="Project Title" value={project?.project_title} />
                        <InfoRow label="Domain" value={
                            project?.domain ? (
                                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium">
                                    {project.domain}
                                </span>
                            ) : null
                        } />
                        <InfoRow label="Submitted On" value={formatDate(project?.created_at)} />
                        <InfoRow label="Order ID" value={
                            project?.order_id ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-white/10 text-zinc-200 text-xs font-mono font-medium">
                                    <Tag className="w-3.5 h-3.5 text-zinc-500" />
                                    {project.order_id}
                                </span>
                            ) : null
                        } />
                        <InfoRow label="Description" value={
                            <p className="text-zinc-400 text-sm leading-relaxed">{project?.description}</p>
                        } />
                    </SectionCard>

                    {/* Meeting Info — 2 cols */}
                    <SectionCard
                        title="Meeting"
                        icon={Video}
                        className="lg:col-span-2"
                    >
                        {project?.meeting_link || project?.meeting_date ? (
                            <div className="space-y-4">
                                {/* Mentor */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Mentor</p>
                                        <p className="text-sm text-zinc-100 font-medium">Assigned Mentor</p>
                                    </div>
                                </div>

                                {project.meeting_date && (
                                    <div className="flex items-center gap-3 py-1">
                                        <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Date</p>
                                            <p className="text-sm text-zinc-200">{project.meeting_date}</p>
                                        </div>
                                    </div>
                                )}
                                {project.meeting_time && (
                                    <div className="flex items-center gap-3 py-1">
                                        <Timer className="w-4 h-4 text-zinc-500 shrink-0" />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Time</p>
                                            <p className="text-sm text-zinc-200">{project.meeting_time}</p>
                                        </div>
                                    </div>
                                )}
                                {project.meeting_link && (
                                    <a
                                        href={project.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 flex items-center justify-center gap-2 w-full px-5 py-3 md:py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-sm font-medium text-white shadow-sm"
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
                <div className="">
                    <SectionCard
                        title="Project Documentation"
                        icon={BookOpen}
                    >
                        {/* ─── Mobile Card Layout (below md) ─── */}
                        <div className="md:hidden space-y-3">
                            {DOCUMENT_TYPES.map(({ key, type, icon: Icon }) => {
                                const doc = (project?.files || []).find((d: ProjectFile) => d.document_type === key);
                                const isAvailable = !!doc;

                                return (
                                    <div key={type} className="bg-zinc-800/30 border border-white/[0.04] rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 rounded-lg bg-white/5 text-zinc-400 shrink-0">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-zinc-200 truncate">{type}</span>
                                            </div>
                                            {isAvailable ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium shrink-0">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Uploaded
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 text-xs font-medium shrink-0">
                                                    Not Available
                                                </span>
                                            )}
                                        </div>
                                        {doc && (
                                            <p className="text-xs text-zinc-500 font-mono truncate">{doc.file_name}</p>
                                        )}
                                        <a
                                            href={isAvailable ? doc!.file_url : undefined}
                                            target={isAvailable ? "_blank" : undefined}
                                            rel={isAvailable ? "noopener noreferrer" : undefined}
                                            className={`w-full flex items-center justify-center py-2.5 rounded-lg text-xs font-medium transition-colors ${isAvailable
                                                ? "bg-white/10 text-white hover:bg-white/15 cursor-pointer"
                                                : "bg-transparent text-zinc-600 cursor-not-allowed border border-white/[0.04]"
                                            }`}
                                            onClick={(e) => { if (!isAvailable) e.preventDefault(); }}
                                        >
                                            Open
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ─── Desktop Table (md and above) ─── */}
                        <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="pb-3 text-xs font-medium text-zinc-500">Document Type</th>
                                            <th className="pb-3 text-xs font-medium text-zinc-500">Status</th>
                                            <th className="pb-3 text-xs font-medium text-zinc-500">File Name</th>
                                            <th className="pb-3 text-xs font-medium text-zinc-500 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {DOCUMENT_TYPES.map(({ key, type, icon: Icon }) => {
                                            const doc = (project?.files || []).find((d: ProjectFile) => d.document_type === key);
                                            const isAvailable = !!doc;

                                            const displayFileName = doc?.file_name
                                                ? (doc.file_name.length > 30 ? doc.file_name.substring(0, 27) + '...' : doc.file_name)
                                                : "—";

                                            return (
                                                <tr key={type} className="group">
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg bg-white/5 text-zinc-400`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-medium text-zinc-200">{type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        {isAvailable ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Uploaded
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 text-xs font-medium">
                                                                Not Available
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <span className="text-sm text-zinc-400 font-mono text-xs" title={doc?.file_name}>
                                                            {displayFileName}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <a
                                                            href={isAvailable ? doc.file_url : undefined}
                                                            target={isAvailable ? "_blank" : undefined}
                                                            rel={isAvailable ? "noopener noreferrer" : undefined}
                                                            className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isAvailable
                                                                ? "bg-white/10 text-white hover:bg-white/15 cursor-pointer"
                                                                : "bg-transparent text-zinc-600 cursor-not-allowed"
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
                    </SectionCard>
                </div>

                {/* ═══════════════════════════════════════════
                    § 6 — Project Deliverables
                   ═══════════════════════════════════════════ */}
                {/* Hidden on mobile */}
                <div className="hidden md:block">
                    <SectionCard
                        title="Project Deliverables"
                        icon={Download}
                    >
                        {project?.files && project.files.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.files.map((file) => {
                                    const ext = file.file_name?.split(".").pop()?.toLowerCase() || "";
                                    let FileIcon = FileText;

                                    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
                                        FileIcon = FileArchive;
                                    } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
                                        FileIcon = PlayCircle;
                                    } else if (["js", "ts", "py", "java", "cpp", "c", "html", "css"].includes(ext)) {
                                        FileIcon = Code2;
                                    } else if (["pdf"].includes(ext)) {
                                        FileIcon = FileText;
                                    }

                                    return (
                                        <a
                                            key={file.id}
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors group/file"
                                        >
                                            <div className={`p-2.5 rounded-lg bg-white/5 text-zinc-400`}>
                                                <FileIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-200 font-medium truncate">{file.file_name}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {formatDate(file.uploaded_at)}
                                                </p>
                                            </div>
                                            <Download className="w-4 h-4 text-zinc-600 group-hover/file:text-white transition-colors shrink-0" />
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
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-zinc-400 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-zinc-500" />
                            You have <span className="text-zinc-100 font-medium">{projects.length}</span> project submissions.
                            Showing the most recent one above.
                        </p>
                    </div>
                )}

                {/* ─── Footer ─── */}
                <div className="text-center pt-8 pb-10">
                    <p className="text-xs text-zinc-600 font-medium">
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
                    <div className="relative bg-[#111111] border border-white/5 rounded-xl shadow-2xl w-[90vw] max-w-[480px] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
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
                                        border: "2px solid rgba(255, 255, 255, 0.5)",
                                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
                                    },
                                }}
                            />
                        </div>
                        {/* Zoom */}
                        <div className="px-6 py-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 rounded-full appearance-none bg-zinc-800 accent-indigo-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                                <ZoomIn className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="px-6 py-5 border-t border-white/5 flex items-center justify-end gap-3">
                            <button
                                onClick={() => { setCropModalOpen(false); setCropImage(null); }}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCrop}
                                disabled={uploading}
                                className="px-6 py-2.5 rounded-lg text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
