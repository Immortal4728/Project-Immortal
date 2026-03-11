"use client";

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import {
    ArrowLeft,
    FolderKanban,
    FileText,
    Download,
    AlertCircle,
    XCircle,
    CheckCircle,
    Loader2,
    Trash2,
    CloudUpload,
    File,
    Shield,
    Check,
    X
} from "lucide-react";

interface ProjectFile {
    id: string;
    project_id: string;
    file_name: string;
    file_url: string;
    document_type: string;
    uploaded_at: string;
}

interface Project {
    id: string;
    name: string;
    email: string;
    project_title: string;
    domain: string;
    status: string;
    order_id: string;
    created_at: string;
    files: ProjectFile[];
}

const DOC_SLOTS = [
    { id: "record", label: "Project Record", desc: "Final record book document" },
    { id: "ppt", label: "PPT Presentation", desc: "Project presentation slides" },
    { id: "viva", label: "Viva Questions", desc: "List of expected questions" },
    { id: "notes", label: "Internal Notes", desc: "Additional guidance notes" },
];

const DOC_TYPE_LABELS = DOC_SLOTS.reduce((acc, slot) => {
    acc[slot.id] = slot.label;
    return acc;
}, {} as Record<string, string>);

// Allowed document extensions
const ALLOWED_EXTENSIONS = [
    ".pdf", ".docx", ".ppt", ".pptx", ".txt"
];

function isAllowedFile(fileName: string): boolean {
    const lower = fileName.toLowerCase();
    return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
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
    return { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "#a78bfa" };
}

function getStatusColor(status: string) {
    const s = status?.toLowerCase() || "";
    if (s === "approved") return { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", text: "#4ade80" };
    if (s === "in_progress" || s === "in progress") return { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: "#60a5fa" };
    if (s === "completed") return { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", text: "#a78bfa" };
    return { bg: "rgba(161,161,170,0.1)", border: "rgba(161,161,170,0.2)", text: "#a1a1aa" };
}

// Exported for reuse in modals (e.g., admin profile Documents modal)
export function WorkspaceContent({ id }: { id: string }) {
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Global messaging
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

    // Track active upload and delete per slot
    const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/employee/project/${id}`);
            const data = await res.json();

            if (data.success) {
                const proj = data.data;
                // Load documents from InsForge
                try {
                    const { data: documents, error: docError } = await insforge.database
                        .from("project_files")
                        .select("*")
                        .eq("project_id", id)
                        .order("uploaded_at", { ascending: false });

                    if (docError) {
                        console.error("InsForge document fetch error:", docError);
                        proj.files = [];
                    } else {
                        proj.files = documents || [];
                    }
                } catch (e) {
                    console.error("InsForge fetch error", e);
                    proj.files = [];
                }
                setProject(proj);
            } else if (res.status === 401) {
                router.push("/employee/login");
            } else {
                setError(data.error || "Failed to fetch project");
            }
        } catch (err) {
            console.error("Fetch project error:", err);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    // Clear messages automatically
    useEffect(() => {
        if (globalSuccess) {
            const t = setTimeout(() => setGlobalSuccess(null), 4000);
            return () => clearTimeout(t);
        }
    }, [globalSuccess]);

    useEffect(() => {
        if (globalError) {
            const t = setTimeout(() => setGlobalError(null), 6000);
            return () => clearTimeout(t);
        }
    }, [globalError]);

    const handleUploadFile = async (file: File, docType: string) => {
        if (!isAllowedFile(file.name)) {
            setGlobalError(`File type not allowed. Please upload pdf, docx, ppt, pptx, or txt files.`);
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setGlobalError(`File size exceeds the 20MB limit.`);
            return;
        }

        setGlobalError(null);
        setGlobalSuccess(null);
        setUploadingSlots((prev) => ({ ...prev, [docType]: true }));

        try {
            console.log("=== Starting Upload Process ===");
            console.log(`Document Type: ${docType}`);
            console.log("Uploading file:", file.name);
            console.log("Type:", file?.type);
            console.log("Size:", file?.size);

            // Check if there's an existing file for this slot and remove it from storage first
            const existingFile = project?.files.find(f => f.document_type === docType);
            if (existingFile) {
                const oldFilePath = `${id}/${docType}/${existingFile.file_name}`;
                console.log(`Attempting to remove old file from storage: ${oldFilePath}`);
                const { error: removeError } = await insforge.storage.from("project_files").remove(oldFilePath);
                if (removeError) {
                    console.warn("Issue removing old file (it may not exist anymore):", removeError);
                } else {
                    console.log("Successfully removed old file from storage.");
                }
            }

            const filePath = `${id}/${docType}/${file.name}`;

            console.log(`Uploading to InsForge Storage: Bucket=project_files, Path=${filePath}`);
            const { data: storageData, error: storageError } = await insforge.storage
                .from("project_files")
                .upload(filePath, file);

            if (storageError) {
                console.error("InsForge Storage Upload Error Details:", storageError);
                throw new Error(`Failed to upload to storage: ${storageError.message || JSON.stringify(storageError)}`);
            }

            console.log("Storage upload successful. Data:", storageData);

            // InsForge returns the URL directly in the upload response
            const fileUrl = storageData?.url || "";
            console.log("File URL:", fileUrl);

            // Save metadata to database
            console.log("Saving metadata to database...");

            if (existingFile) {
                // Update existing record
                const { error: dbError } = await insforge.database
                    .from("project_files")
                    .update({
                        file_name: file.name,
                        file_url: fileUrl,
                        uploaded_at: new Date().toISOString()
                    })
                    .eq("project_id", id)
                    .eq("document_type", docType);

                if (dbError) {
                    console.error("Database update error:", dbError);
                    throw new Error("Failed to save to database: " + dbError.message);
                }
            } else {
                // Insert new record
                const { error: dbError } = await insforge.database
                    .from("project_files")
                    .insert({
                        project_id: id,
                        document_type: docType,
                        file_name: file.name,
                        file_url: fileUrl,
                        uploaded_at: new Date().toISOString()
                    });

                if (dbError) {
                    console.error("Database insert error:", dbError);
                    throw new Error("Failed to save to database: " + dbError.message);
                }
            }

            console.log("=== Upload Process Completed Successfully ===");
            setGlobalSuccess(`${DOC_TYPE_LABELS[docType]} uploaded successfully!`);
            await fetchProject();
        } catch (err: any) {
            console.error("=== Upload Process Failed ===");
            console.error("Error details:", err);
            const errMsg = err?.message || JSON.stringify(err);
            setGlobalError(errMsg || "An error occurred during upload.");
        } finally {
            setUploadingSlots((prev) => ({ ...prev, [docType]: false }));
            // Reset the specific file input
            if (fileInputRefs.current[docType]) {
                fileInputRefs.current[docType]!.value = "";
            }
        }
    };

    const handleDelete = async (file: ProjectFile) => {
        if (deletingId) return;
        setDeletingId(file.id);
        setGlobalError(null);
        setGlobalSuccess(null);

        try {
            // Delete from storage
            const filePath = `${file.project_id}/${file.document_type}/${file.file_name}`;
            const { error: storageErr } = await insforge.storage.from("project_files").remove(filePath);
            if (storageErr) {
                console.warn("Storage delete issue (may already be gone):", storageErr);
            }

            // Delete from database
            const { error: dbErr } = await insforge.database
                .from("project_files")
                .delete()
                .eq("project_id", file.project_id)
                .eq("document_type", file.document_type);

            if (dbErr) {
                console.error("Database delete error:", dbErr);
                throw new Error("Failed to delete from database: " + dbErr.message);
            }

            // Remove from local state immediately to reflect UI update
            setProject((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    files: prev.files.filter((f) => !(f.project_id === file.project_id && f.document_type === file.document_type)),
                };
            });
            setGlobalSuccess(`${DOC_TYPE_LABELS[file.document_type] || "Document"} deleted successfully.`);
        } catch (err) {
            console.error("Delete error:", err);
            setGlobalError("Failed to delete file.");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
                    </div>
                    <p className="text-zinc-500 font-medium text-sm font-[family-name:var(--font-body)]">
                        Loading workspace...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 text-center space-y-4">
                    <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-rose-400 font-semibold text-sm">{error || "Project not found"}</p>
                    <button
                        onClick={() => router.push("/employee/dashboard")}
                        className="text-violet-400 hover:text-violet-300 hover:underline text-sm transition-colors font-[family-name:var(--font-body)]"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const domainColor = getDomainColor(project.domain);
    const statusColor = getStatusColor(project.status);

    // Group files by type, taking the most recent one if multiple (API returns DESC)
    const filesByType = project.files.reduce((acc, file) => {
        if (!acc[file.document_type]) {
            acc[file.document_type] = file;
        }
        return acc;
    }, {} as Record<string, ProjectFile>);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-heading)]">
            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] right-[5%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
                <div className="absolute bottom-[-15%] left-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/[0.03] blur-[100px]" />
            </div>

            <div className="relative w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/employee/dashboard")}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all duration-300 text-sm font-semibold font-[family-name:var(--font-body)]"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Dashboard
                </button>

                {/* Page Title */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                        <p className="text-[11px] font-semibold text-violet-400/80 tracking-[0.2em] uppercase font-[family-name:var(--font-body)]">
                            Documentation Workspace
                        </p>
                    </div>
                    <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">
                        {project.project_title || "Untitled Project"}
                    </h1>
                </div>

                {/* Global Messages */}
                {globalError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm animate-element">
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span className="text-rose-400 text-sm font-medium font-[family-name:var(--font-body)]">
                            {globalError}
                        </span>
                    </div>
                )}
                {globalSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm animate-element">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 text-sm font-medium font-[family-name:var(--font-body)]">
                            {globalSuccess}
                        </span>
                    </div>
                )}

                {/* Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT PANEL — Project Info (Simplified) */}
                    <div className="lg:w-[280px] shrink-0 space-y-6">
                        <div
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5"
                            style={{
                                animation: "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                                opacity: 0,
                            }}
                        >
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
                                <FolderKanban className="w-4 h-4 text-violet-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Project Info</h2>
                            </div>

                            <div className="space-y-4 font-[family-name:var(--font-body)] text-sm">
                                <div>
                                    <span className="text-zinc-600 uppercase text-[9px] font-bold tracking-[0.15em] block mb-1">
                                        Student Name
                                    </span>
                                    <p className="text-zinc-200 font-medium">{project.name}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-600 uppercase text-[9px] font-bold tracking-[0.15em] block mb-1">
                                        Project Title
                                    </span>
                                    <p className="text-zinc-300 font-medium leading-snug">
                                        {project.project_title || "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-zinc-600 uppercase text-[9px] font-bold tracking-[0.15em] block mb-1.5">
                                        Domain
                                    </span>
                                    <span
                                        className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold"
                                        style={{
                                            background: domainColor.bg,
                                            border: `1px solid ${domainColor.border}`,
                                            color: domainColor.text,
                                        }}
                                    >
                                        {project.domain || "—"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-zinc-600 uppercase text-[9px] font-bold tracking-[0.15em] block mb-1.5">
                                        Status
                                    </span>
                                    <span
                                        className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize"
                                        style={{
                                            background: statusColor.bg,
                                            border: `1px solid ${statusColor.border}`,
                                            color: statusColor.text,
                                        }}
                                    >
                                        {project.status}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-white/[0.04]">
                                    <span className="text-zinc-600 uppercase text-[9px] font-bold tracking-[0.15em] block mb-1">
                                        Order ID
                                    </span>
                                    <span className="font-mono text-zinc-500 text-xs text-opacity-80">
                                        {project.order_id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Source code validation hint */}
                        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-start gap-3">
                            <Shield className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-zinc-500 leading-relaxed font-[family-name:var(--font-body)]">
                                You are restricted strictly to documentation. Uploading source code (.js, .py, .java, etc.) will be automatically blocked by the system.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL — 2x2 Document Slots Grid */}
                    {/* RIGHT PANEL — Document List */}
                    <div className="flex-1">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-md"
                            style={{
                                animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                                animationDelay: "100ms",
                                opacity: 0,
                            }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-white/[0.02] border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest font-semibold font-[family-name:var(--font-body)]">
                                        <tr>
                                            <th className="px-6 py-4">Document Type</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">File Name</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {DOC_SLOTS.map((slot, index) => {
                                            const file = filesByType[slot.id];
                                            const isUploading = uploadingSlots[slot.id];
                                            const isDeleting = deletingId === file?.id;

                                            return (
                                                <tr key={slot.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    {/* Hidden input for this row */}
                                                    <td className="hidden">
                                                        <input
                                                            type="file"
                                                            ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const selected = e.target.files?.[0];
                                                                if (selected) handleUploadFile(selected, slot.id);
                                                            }}
                                                        />
                                                    </td>

                                                    {/* Document Type */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                                                                <FileText className="w-4 h-4 text-violet-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-white mb-0.5">{slot.label}</p>
                                                                <p className="text-[11px] text-zinc-500 font-[family-name:var(--font-body)]">{slot.desc}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-6 py-4">
                                                        {file ? (
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-md uppercase tracking-wider">
                                                                Uploaded <Check className="w-3 h-3" />
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 bg-white/[0.04] border border-white/[0.05] px-2.5 py-1.5 rounded-md uppercase tracking-wider">
                                                                Not Uploaded <X className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* File Name */}
                                                    <td className="px-6 py-4 max-w-[200px] truncate">
                                                        {isUploading ? (
                                                            <div className="flex items-center gap-2 text-violet-400">
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                <span className="text-xs font-medium">Uploading...</span>
                                                            </div>
                                                        ) : file ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] text-zinc-200 font-medium truncate">{file.file_name}</span>
                                                                <span className="text-[10px] text-zinc-500 font-[family-name:var(--font-body)] mt-0.5">
                                                                    {formatDate(file.uploaded_at)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-zinc-600 font-medium text-sm">—</span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {file ? (
                                                                <>
                                                                    <a
                                                                        href={file.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/[0.08]"
                                                                    >
                                                                        Open
                                                                    </a>
                                                                    <button
                                                                        onClick={() => fileInputRefs.current[slot.id]?.click()}
                                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors border border-transparent hover:border-violet-500/20"
                                                                        disabled={isUploading || isDeleting}
                                                                    >
                                                                        Replace
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(file)}
                                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 flex items-center justify-center min-w-[60px]"
                                                                        disabled={isUploading || isDeleting}
                                                                    >
                                                                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => fileInputRefs.current[slot.id]?.click()}
                                                                    className="text-[11px] font-bold text-violet-400 hover:text-violet-300 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all font-[family-name:var(--font-body)] uppercase tracking-wider"
                                                                    disabled={isUploading}
                                                                >
                                                                    Upload
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Default export for Next.js page routing (unwraps Promise params)
export default function EmployeeProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    return <WorkspaceContent id={unwrappedParams.id} />;
}
