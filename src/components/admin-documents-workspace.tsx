"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { insforge } from "@/lib/insforge";
import {
    FileText,
    AlertCircle,
    CheckCircle,
    Loader2,
    CloudUpload,
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

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".ppt", ".pptx", ".txt"];

function isAllowedFile(fileName: string): boolean {
    return ALLOWED_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext));
}

export default function AdminDocumentsWorkspace({
    projectId,
    projectTitle,
    studentName,
}: {
    projectId: string;
    projectTitle: string;
    studentName: string;
}) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
    const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const fetchFiles = useCallback(async () => {
        try {
            const { data: documents, error } = await insforge.database
                .from("project_files")
                .select("*")
                .eq("project_id", projectId)
                .order("uploaded_at", { ascending: false });

            if (error) {
                console.error("Fetch docs error:", error);
                setFiles([]);
            } else {
                setFiles(documents || []);
            }
        } catch (e) {
            console.error("Fetch error:", e);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

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
            setGlobalError("File type not allowed. Please upload pdf, docx, ppt, pptx, or txt files.");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setGlobalError("File size exceeds the 20MB limit.");
            return;
        }

        setGlobalError(null);
        setGlobalSuccess(null);
        setUploadingSlots((prev) => ({ ...prev, [docType]: true }));

        try {
            const existingFile = files.find((f) => f.document_type === docType);
            if (existingFile) {
                const oldPath = `${projectId}/${docType}/${existingFile.file_name}`;
                await insforge.storage.from("project_files").remove(oldPath);
            }

            const filePath = `${projectId}/${docType}/${file.name}`;
            const { data: storageData, error: storageError } = await insforge.storage
                .from("project_files")
                .upload(filePath, file);

            if (storageError) {
                throw new Error(`Upload failed: ${storageError.message || JSON.stringify(storageError)}`);
            }

            const fileUrl = storageData?.url || "";

            if (existingFile) {
                const { error: dbError } = await insforge.database
                    .from("project_files")
                    .update({
                        file_name: file.name,
                        file_url: fileUrl,
                        uploaded_at: new Date().toISOString(),
                    })
                    .eq("project_id", projectId)
                    .eq("document_type", docType);

                if (dbError) throw new Error("Database update failed: " + dbError.message);
            } else {
                const { error: dbError } = await insforge.database
                    .from("project_files")
                    .insert({
                        project_id: projectId,
                        document_type: docType,
                        file_name: file.name,
                        file_url: fileUrl,
                        uploaded_at: new Date().toISOString(),
                    });

                if (dbError) throw new Error("Database insert failed: " + dbError.message);
            }

            setGlobalSuccess(`${DOC_TYPE_LABELS[docType]} uploaded successfully!`);
            await fetchFiles();
        } catch (err: any) {
            console.error("Upload failed:", err);
            setGlobalError(err?.message || "An error occurred during upload.");
        } finally {
            setUploadingSlots((prev) => ({ ...prev, [docType]: false }));
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
            const filePath = `${file.project_id}/${file.document_type}/${file.file_name}`;
            await insforge.storage.from("project_files").remove(filePath);

            const { error: dbErr } = await insforge.database
                .from("project_files")
                .delete()
                .eq("project_id", file.project_id)
                .eq("document_type", file.document_type);

            if (dbErr) throw new Error("Delete failed: " + dbErr.message);

            setFiles((prev) =>
                prev.filter((f) => !(f.project_id === file.project_id && f.document_type === file.document_type))
            );
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

    const filesByType = files.reduce((acc, file) => {
        if (!acc[file.document_type]) acc[file.document_type] = file;
        return acc;
    }, {} as Record<string, ProjectFile>);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
                    </div>
                    <p className="text-zinc-500 font-medium text-sm">Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6 font-[family-name:var(--font-body)]">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <p className="text-[11px] font-semibold text-emerald-400/80 tracking-[0.2em] uppercase">
                        Admin Document Workspace
                    </p>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
                    {projectTitle || "Untitled Project"}
                </h2>
                <p className="text-zinc-500 text-sm">Student: {studentName}</p>
            </div>

            {/* Messages */}
            {globalError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="text-rose-400 text-sm font-medium">{globalError}</span>
                </div>
            )}
            {globalSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 text-sm font-medium">{globalSuccess}</span>
                </div>
            )}

            {/* Document Table */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/[0.02] border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">
                            <tr>
                                <th className="px-6 py-4">Document Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">File Name</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {DOC_SLOTS.map((slot) => {
                                const file = filesByType[slot.id];
                                const isUploading = uploadingSlots[slot.id];
                                const isDeleting = deletingId === file?.id;

                                return (
                                    <tr key={slot.id} className="hover:bg-white/[0.02] transition-colors group">
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-white mb-0.5">{slot.label}</p>
                                                    <p className="text-[11px] text-zinc-500">{slot.desc}</p>
                                                </div>
                                            </div>
                                        </td>
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
                                        <td className="px-6 py-4 max-w-[200px] truncate">
                                            {isUploading ? (
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span className="text-xs font-medium">Uploading...</span>
                                                </div>
                                            ) : file ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] text-zinc-200 font-medium truncate">{file.file_name}</span>
                                                    <span className="text-[10px] text-zinc-500 mt-0.5">{formatDate(file.uploaded_at)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-600 font-medium text-sm">—</span>
                                            )}
                                        </td>
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
                                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-transparent hover:border-emerald-500/20"
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
                                                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all uppercase tracking-wider"
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

            {/* Hint */}
            <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-start gap-3">
                <Shield className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                    As an admin, you can directly upload, replace, or delete project documentation. Only pdf, docx, ppt, pptx, and txt files are accepted. Max file size: 20MB.
                </p>
            </div>
        </div>
    );
}
