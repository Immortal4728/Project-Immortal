"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    FileText,
    Globe,
    Calendar,
    Tag,
    ChevronDown,
    AlertCircle,
} from "lucide-react";
import Alert from "@/components/ui/alert";

/* ─── Types ─── */
interface Submission {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    college?: string;
    domain: string;
    description?: string;
    project_title?: string;
    status?: string;
    created_at?: string;
    date?: string;
    submittedAt?: string;
    [key: string]: unknown;
}

/* ─── Status Dropdown ─── */
function StatusSelector({
    currentStatus,
    onSelect,
    disabled,
}: {
    currentStatus: string;
    onSelect: (status: string) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const statusLower = currentStatus?.toLowerCase() || "pending";

    const options = ["pending", "approved", "rejected"] as const;

    const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        pending: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25", dot: "bg-amber-400" },
        approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25", dot: "bg-emerald-400" },
        rejected: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/25", dot: "bg-rose-400" },
    };

    const c = colorMap[statusLower] || colorMap.pending;

    return (
        <div className="relative inline-block">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold tracking-wide capitalize cursor-pointer transition-all duration-200 hover:brightness-125 disabled:opacity-50 disabled:cursor-not-allowed ${c.bg} ${c.text} ${c.border}`}
            >
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                {statusLower}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-full mt-2 z-[95] w-44 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden py-1">
                        {options.map((opt) => {
                            const oc = colorMap[opt];
                            const isActive = opt === statusLower;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (opt !== statusLower) onSelect(opt);
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium tracking-wide capitalize flex items-center gap-3 transition-colors
                                        ${isActive ? "bg-white/5 text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${oc.dot}`} />
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Info Field Component ─── */
function InfoField({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-zinc-800/40 rounded-xl p-4 border border-white/[0.04] transition-colors hover:border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-white">{children}</div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function SubmissionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const submissionId = params.id as string;

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [actionAlert, setActionAlert] = useState<{
        type: "success" | "error" | "info" | "warning";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (!submissionId) return;

        const fetchSubmission = async () => {
            try {
                setLoading(true);
                const { data, error: fetchError } = await insforge.database
                    .from("project_requests")
                    .select("*")
                    .eq("id", submissionId);

                if (fetchError) {
                    console.error("Fetch error:", fetchError);
                    setError("Failed to load submission details.");
                } else if (!data || data.length === 0) {
                    setError("Submission not found.");
                } else {
                    setSubmission(data[0]);
                }
            } catch (err) {
                console.error("Error fetching submission:", err);
                setError("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submissionId]);

    const handleStatusChange = async (newStatus: string) => {
        if (!submission) return;
        setUpdating(true);

        try {
            const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            const res = await fetch("/api/admin/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: submission.id, status: capitalizedStatus }),
            });

            const data = await res.json();

            if (data && data.success) {
                setSubmission((prev) => (prev ? { ...prev, status: data.data.status } : prev));
                setActionAlert({ type: "success", message: `Status updated to ${capitalizedStatus}` });
                setTimeout(() => setActionAlert(null), 3000);
            } else {
                setActionAlert({ type: "error", message: data?.error || "Failed to update status" });
                setTimeout(() => setActionAlert(null), 3000);
            }
        } catch (err) {
            setActionAlert({ type: "error", message: "Error updating status: " + (err instanceof Error ? err.message : String(err)) });
            setTimeout(() => setActionAlert(null), 3000);
        } finally {
            setUpdating(false);
        }
    };

    const getFormattedDate = (sub: Submission) => {
        const d = sub.created_at || sub.date || sub.submittedAt;
        if (!d) return "N/A";
        return new Date(d).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getFormattedTime = (sub: Submission) => {
        const d = sub.created_at || sub.date || sub.submittedAt;
        if (!d) return "";
        return new Date(d).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status?: string) => {
        const lower = status?.toLowerCase() || "pending";
        switch (lower) {
            case "approved":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
            case "rejected":
                return "bg-rose-500/10 text-rose-400 border-rose-500/25";
            default:
                return "bg-amber-500/10 text-amber-400 border-amber-500/25";
        }
    };

    /* Loading State */
    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-500 text-sm font-medium tracking-wide">Loading project details...</p>
            </div>
        );
    }

    /* Error State */
    if (error || !submission) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => router.push("/admin/submissions")}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Submissions
                </button>
                <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-rose-500/10 bg-rose-500/[0.03] space-y-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-rose-400" />
                    </div>
                    <p className="text-rose-400 font-semibold text-sm">{error || "Submission not found"}</p>
                    <button
                        onClick={() => router.push("/admin/submissions")}
                        className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
                    >
                        Return to submissions list
                    </button>
                </div>
            </div>
        );
    }

    const statusLower = (submission.status || "pending").toLowerCase();

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 font-[family-name:var(--font-body)]">
            {/* ─── Back Navigation ─── */}
            <button
                onClick={() => router.push("/admin/submissions")}
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Submissions
            </button>

            {/* ─── Alert ─── */}
            {actionAlert && <Alert type={actionAlert.type} message={actionAlert.message} />}

            {/* ─── Page Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)] truncate">
                        {submission.project_title || "Untitled Project"}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-800 border border-white/[0.06] text-zinc-300 text-xs font-medium tracking-wide">
                            <Globe className="w-3 h-3 mr-1.5 text-zinc-500" />
                            {submission.domain}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold tracking-wide capitalize ${getStatusColor(submission.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusLower === "approved" ? "bg-emerald-400" : statusLower === "rejected" ? "bg-rose-400" : "bg-amber-400"}`} />
                            {statusLower}
                        </span>
                        <span className="text-xs text-zinc-600">
                            Submitted {getFormattedDate(submission)} {getFormattedTime(submission) && `at ${getFormattedTime(submission)}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Section 1: Applicant Information ─── */}
            <section className="space-y-3">
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Applicant Information
                </h2>
                <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg uppercase ring-1 ring-indigo-500/20 flex-shrink-0">
                            {submission.name ? submission.name.substring(0, 2) : "?"}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-white tracking-tight">{submission.name}</p>
                            <p className="text-sm text-zinc-500">{submission.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InfoField icon={User} label="Full Name">
                            <p className="text-sm font-medium">{submission.name}</p>
                        </InfoField>
                        <InfoField icon={Mail} label="Email Address">
                            <a
                                href={`mailto:${submission.email}`}
                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {submission.email}
                            </a>
                        </InfoField>
                        <InfoField icon={Phone} label="Phone / WhatsApp">
                            {submission.phone ? (
                                <a
                                    href={`https://wa.me/91${submission.phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium hover:underline"
                                >
                                    {submission.phone}
                                </a>
                            ) : (
                                <p className="text-sm font-medium text-zinc-500">Not provided</p>
                            )}
                        </InfoField>
                    </div>
                </div>
            </section>

            {/* ─── Section 2: Project Information ─── */}
            <section className="space-y-3">
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Project Information
                </h2>
                <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField icon={FileText} label="Project Title">
                            <p className="text-base font-semibold tracking-tight">
                                {submission.project_title || "Untitled Project"}
                            </p>
                        </InfoField>
                        <InfoField icon={Globe} label="Project Domain">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-zinc-700/50 border border-white/[0.06] text-zinc-300 text-sm font-medium">
                                {submission.domain}
                            </span>
                        </InfoField>
                        <InfoField icon={Calendar} label="Submission Date">
                            <p className="text-sm font-medium">
                                {getFormattedDate(submission)}
                                {getFormattedTime(submission) && (
                                    <span className="text-zinc-500 ml-2 text-xs">{getFormattedTime(submission)}</span>
                                )}
                            </p>
                        </InfoField>
                        <InfoField icon={Tag} label="Current Status">
                            <StatusSelector
                                currentStatus={submission.status || "pending"}
                                onSelect={handleStatusChange}
                                disabled={updating}
                            />
                        </InfoField>
                    </div>
                </div>
            </section>

            {/* ─── Section 3: Project Description ─── */}
            <section className="space-y-3">
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Project Description
                </h2>
                <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="bg-zinc-800 p-6 sm:p-8 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap min-h-[160px]">
                        {submission.description || "No description was provided for this project request."}
                    </div>
                </div>
            </section>

            {/* ─── Bottom Spacer ─── */}
            <div className="h-8" />
        </div>
    );
}
