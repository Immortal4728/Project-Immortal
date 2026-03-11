"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper, { Area } from "react-easy-crop";
import {
  User,
  Loader2,
  Camera,
  Trash2,
  Edit3,
  Shield,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  Mail,
  KeyRound,
  CalendarDays,
  Activity,
  Users,
  Sparkles,
  ImageUp,
  MessageSquare,
  CalendarPlus,
  FolderKanban,
  Clock,
  CheckCircle,
  XCircle,
  Code2,
  FileText,
  Layers,
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import AdminDocumentsWorkspace from "@/components/admin-documents-workspace";

/* ─── Types ─── */
interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
  created_at: string;
}

interface CustomerCard {
  id: string;
  name: string;
  email: string;
  project_title: string;
  account_active: boolean;
  profile_picture?: string;
  student_profile_photo?: string;
  domain?: string;
  status?: string;
  meeting_date?: string;
  meeting_time?: string;
  meeting_link?: string;
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

/* ─── Page ─── */
export default function AdminProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Crop modal
  const adminFileInput = useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadingAdmin, setUploadingAdmin] = useState(false);

  // Modals state
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Meeting form
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [savingMeeting, setSavingMeeting] = useState(false);

  // Progress form
  const [progressStatus, setProgressStatus] = useState("pending");
  const [savingProgress, setSavingProgress] = useState(false);

  /* ─── Fetch ─── */
  const fetchData = async () => {
    try {
      setLoading(true);
      let localToken = "";
      if (typeof window !== "undefined") {
        localToken = localStorage.getItem("token") || "";
        if (!localToken) {
          const cookieMatch = document.cookie.match(/(^| )token=([^;]+)/);
          if (cookieMatch) localToken = cookieMatch[2];
        }
      }
      if (!localToken) { router.push("/login"); return; }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localToken}`,
      };

      const [adminRes, custRes] = await Promise.all([
        fetch("/api/admin/profile", { headers }).then((r) => r.json()),
        fetch("/api/admin/customers", { headers }).then((r) => r.json()),
      ]);

      if (adminRes.success) {
        setAdmin(adminRes.data);
      } else {
        if (
          adminRes.status === 401 ||
          adminRes.error === "Unauthorized" ||
          adminRes.error === "Invalid or expired token" ||
          adminRes.error === "Failed to locate verified admin session"
        ) { router.push("/login"); return; }
        setError(adminRes.error || "Failed to load admin profile data");
      }
      if (custRes.success) setCustomers(custRes.data);
    } catch (err) {
      console.error("Failed to load profile data:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  /* ─── Crop Flow ─── */
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

  const STAGES = [
    { key: "submitted", label: "Submitted" },
    { key: "review", label: "Review" },
    { key: "approved", label: "Approved" },
    { key: "development", label: "Development" },
    { key: "delivery", label: "Delivery" },
    { key: "completed", label: "Completed" },
  ];

  /* ─── Control Handlers ─── */
  const openMeetingModal = (c: CustomerCard) => {
    setActiveCustomerId(c.id);
    setMeetingDate(c.meeting_date || "");
    setMeetingTime(c.meeting_time || "");
    setMeetingLink(c.meeting_link || "");
    setMeetingModalOpen(true);
  };

  const handleSaveMeeting = async () => {
    if (!activeCustomerId) return;
    try {
      setSavingMeeting(true);
      const res = await fetch(`/api/admin/customers/${activeCustomerId}/meeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_date: meetingDate, meeting_time: meetingTime, meeting_link: meetingLink })
      });
      if (res.ok) {
        setCustomers((prev) => prev.map(c => c.id === activeCustomerId ? { ...c, meeting_date: meetingDate, meeting_time: meetingTime, meeting_link: meetingLink } : c));
        setMeetingModalOpen(false);
      } else {
        alert("Failed to save meeting");
      }
    } catch {
      alert("Error saving meeting");
    } finally {
      setSavingMeeting(false);
    }
  };

  const openProgressModal = async (c: CustomerCard) => {
    setActiveCustomerId(c.id);
    setProgressStatus(c.status || "submitted"); // Default fallback
    setProgressModalOpen(true);

    try {
      // Fetch exact progress_stage from InsForge
      const { data, error } = await insforge.database
        .from("project_requests")
        .select("progress_stage")
        .eq("id", c.id)
        .single();

      if (data && data.progress_stage) {
        setProgressStatus(data.progress_stage);
      }
    } catch (err) {
      console.error("Error fetching progress stage:", err);
    }
  };

  const handleSaveProgress = async () => {
    if (!activeCustomerId) return;
    try {
      setSavingProgress(true);

      console.log("Updating project:", activeCustomerId, progressStatus);

      // Update InsForge directly
      const { data, error } = await insforge.database
        .from("project_requests")
        .update({ progress_stage: progressStatus.toLowerCase() })
        .eq("id", activeCustomerId);

      if (error) {
        console.error("InsForge update error:", error);
      }

      if (!error) {
        setProgressModalOpen(false);
        showToast("Project progress updated successfully!", "success");
        // Refresh local state to update customer card
        setCustomers((prev) => prev.map(c => c.id === activeCustomerId ? { ...c, status: progressStatus } : c));
        // Refresh the customer list
        await fetchData();
      } else {
        showToast("Failed to save progress: " + error.message, "error");
      }
    } catch (err: any) {
      console.error("InsForge update error:", err);
      showToast("Error updating progress", "error");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!cropImage || !croppedAreaPixels || !admin) return;
    try {
      setUploadingAdmin(true);
      const croppedBase64 = await getCroppedImg(cropImage, croppedAreaPixels);
      const res = await fetch("/api/admin/profile/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admin.id, type: "admin", image: croppedBase64 }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmin((prev) => prev ? { ...prev, profile_picture: data.url } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAdmin(false);
      setCropModalOpen(false);
      setCropImage(null);
    }
  };

  // Remove Customer Action removed as per requirement replacing actions.

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-5">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-emerald-500/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <p className="text-zinc-500 font-medium tracking-wide text-sm">Loading profile...</p>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-5">
        <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-medium tracking-wide text-sm">Redirecting...</p>
      </div>
    );
  }

  const initials = admin.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  /* ─── Detail row component ─── */
  const DetailRow = ({
    icon: Icon,
    label,
    value,
    hoverColor = "emerald",
    children,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string;
    hoverColor?: string;
    children?: React.ReactNode;
  }) => {
    const colorMap: Record<string, string> = {
      emerald: "group-hover/d:border-emerald-500/25 group-hover/d:text-emerald-400",
      indigo: "group-hover/d:border-indigo-500/25 group-hover/d:text-indigo-400",
      amber: "group-hover/d:border-amber-500/25 group-hover/d:text-amber-400",
    };
    return (
      <div className="group/d flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.025] transition-all duration-200">
        <div className={`w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0 transition-colors ${colorMap[hoverColor]}`}>
          <Icon className={`w-[18px] h-[18px] text-zinc-500 transition-colors ${colorMap[hoverColor]}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.14em] mb-0.5">
            {label}
          </p>
          {children || (
            <p className="text-[14px] text-zinc-200 font-medium truncate">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="text-white w-full max-w-6xl mx-auto space-y-16 font-[family-name:var(--font-body)] pb-8">

        {/* ════════════════════════════════════════════
            ADMIN PROFILE HERO
           ════════════════════════════════════════════ */}
        <div className="relative">
          {/* Background gradient band */}
          <div className="absolute inset-x-0 top-0 h-[200px] rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0a0e0c] to-indigo-950/20 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-60" />
            <div className="absolute -left-10 top-0 w-64 h-64 bg-emerald-500/[0.08] rounded-full blur-[80px]" />
            <div className="absolute -right-10 top-0 w-48 h-48 bg-indigo-500/[0.06] rounded-full blur-[60px]" />
          </div>

          {/* Profile content */}
          <div className="relative pt-12 px-2">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="px-8 sm:px-10 py-10">
                {/* Top row: Avatar + Identity + Details */}
                <div className="flex flex-col lg:flex-row gap-10">

                  {/* ─ Avatar + Identity ─ */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-6 lg:gap-5 lg:w-[240px] flex-shrink-0">
                    {/* Avatar */}
                    <div
                      className="relative group/avatar cursor-pointer flex-shrink-0"
                      onClick={() => adminFileInput.current?.click()}
                    >
                      <div className="w-[140px] h-[140px] rounded-full overflow-hidden bg-zinc-900 ring-[3px] ring-white/[0.08] ring-offset-[6px] ring-offset-[#0a0a0a] transition-all duration-300 group-hover/avatar:ring-emerald-500/30 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                        {admin.profile_picture ? (
                          <img
                            src={admin.profile_picture}
                            alt={admin.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                            <span className="text-4xl font-bold text-zinc-500 select-none">{initials}</span>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                          {uploadingAdmin ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-5 h-5 text-white mb-1" />
                              <span className="text-[9px] font-bold tracking-[0.18em] text-white/80 uppercase">
                                Change Photo
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      ref={adminFileInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileSelected}
                    />

                    {/* Name + Badges */}
                    <div className="flex flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center">
                      <h1 className="text-2xl font-bold text-white tracking-tight mb-3 font-[family-name:var(--font-heading)]">
                        {admin.name}
                      </h1>
                      <div className="flex flex-wrap justify-center sm:justify-start lg:justify-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.1] border border-emerald-500/20 text-[10px] font-bold tracking-[0.14em] uppercase text-emerald-400">
                          <Shield className="w-3 h-3" />
                          Super Admin
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold tracking-[0.14em] uppercase text-zinc-500">
                          <Sparkles className="w-3 h-3" />
                          Root Authority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ─ Profile Details Grid ─ */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-5 pl-1">
                      Profile Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailRow icon={Mail} label="Email Address" value={admin.email} hoverColor="emerald" />
                      <DetailRow icon={KeyRound} label="Security Role" hoverColor="indigo">
                        <p className="text-[14px] text-zinc-200 font-medium capitalize">{admin.role}</p>
                      </DetailRow>
                      <DetailRow icon={CalendarDays} label="Account Since" hoverColor="amber">
                        <p className="text-[14px] text-zinc-200 font-medium">
                          {new Date(admin.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </DetailRow>
                      <DetailRow icon={Activity} label="Session Status" hoverColor="emerald">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <p className="text-[14px] text-emerald-400 font-semibold">Verified Session</p>
                        </div>
                      </DetailRow>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            CUSTOMERS SECTION
           ════════════════════════════════════════════ */}
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
                  Target Customers
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Manage customer identities and account access
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 bg-white/[0.025] border border-white/[0.05] px-3.5 py-2 rounded-lg tracking-wide">
              {customers.length} {customers.length === 1 ? "customer" : "customers"}
            </span>
          </div>

          {/* Customer Grid */}
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-5">
                <Users className="w-9 h-9 text-zinc-700" />
              </div>
              <p className="text-zinc-400 text-base font-semibold">No customers found yet</p>
              <p className="text-zinc-600 text-sm mt-2 max-w-xs">Customer accounts will appear here once they submit project requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {customers.map((c) => {
                const custInitials = c.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

                // Status Badge logic
                const statusStr = c.status?.toLowerCase() || "pending";
                let statusConfig = { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-400", icon: Clock, label: statusStr };
                if (statusStr === "submitted") statusConfig = { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: FolderKanban, label: "Submitted" };
                else if (statusStr === "review") statusConfig = { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: Clock, label: "Review" };
                else if (statusStr === "approved") statusConfig = { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle, label: "Approved" };
                else if (statusStr === "development") statusConfig = { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", icon: Code2, label: "Development" };
                else if (statusStr === "delivery") statusConfig = { bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-400", icon: FolderKanban, label: "Delivery" };
                else if (statusStr === "completed") statusConfig = { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle, label: "Completed" };

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={c.id}
                    className="group relative bg-[#0b0b0b]/90 backdrop-blur-sm border border-white/[0.05] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_56px_rgba(0,0,0,0.5)] hover:border-white/[0.12] hover:-translate-y-1.5 transition-all duration-300"
                  >
                    {/* Top accent line */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="p-6 flex flex-col items-center">
                      {/* ─ Avatar ─ */}
                      <div className="relative mb-4">
                        <div className="w-[84px] h-[84px] rounded-full overflow-hidden bg-zinc-800/80 ring-[3px] ring-white/[0.06] ring-offset-[4px] ring-offset-[#0b0b0b] group-hover:ring-white/[0.12] transition-all duration-300">
                          {c.student_profile_photo || c.profile_picture ? (
                            <img
                              src={c.student_profile_photo || c.profile_picture}
                              alt={c.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                              <span className="text-xl font-bold text-zinc-600 select-none">{custInitials}</span>
                            </div>
                          )}
                        </div>
                        {/* Status indicator */}
                        <span
                          className={`absolute bottom-0.5 right-0.5 w-[16px] h-[16px] rounded-full border-[3px] border-[#0b0b0b] ${c.account_active
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                            : "bg-zinc-600"
                            }`}
                          title={c.account_active ? "Active" : "Inactive"}
                        />
                      </div>

                      {/* ─ Identity ─ */}
                      <h3 className="font-bold text-[15px] text-white tracking-tight truncate w-full text-center mb-1">
                        {c.name}
                      </h3>
                      <p className="text-zinc-400 text-[12px] truncate w-full text-center font-medium mb-3" title={c.project_title || "Untitled"}>
                        {c.project_title || "Untitled Domain"}
                      </p>

                      {/* ─ Badges ─ */}
                      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 w-full">
                        {c.domain && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold tracking-wide truncate max-w-full">
                            <Layers className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{c.domain}</span>
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg} border ${statusConfig.border} ${statusConfig.text} text-[10px] font-semibold tracking-wide whitespace-nowrap`}>
                          <StatusIcon className="w-2.5 h-2.5 shrink-0" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* ─ Divider ─ */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-4" />

                      {/* ─ Actions ─ */}
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                          onClick={() => router.push(`/admin/submissions/${c.id}`)}
                          className="py-2 flex justify-center items-center gap-1.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all duration-200 border border-white/[0.04] hover:border-white/[0.1] text-[11px] font-medium"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3" />
                          Details
                        </button>
                        <button
                          onClick={() => openMeetingModal(c)}
                          className="py-2 flex justify-center items-center gap-1.5 rounded-xl bg-sky-500/[0.06] hover:bg-sky-500/[0.14] text-sky-400 hover:text-sky-300 transition-all duration-200 border border-sky-500/[0.08] hover:border-sky-500/[0.25] text-[11px] font-medium"
                          title="Schedule Meeting"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          Meeting
                        </button>
                        <button
                          onClick={() => {
                            setActiveCustomerId(c.id);
                            setDocsModalOpen(true);
                          }}
                          className="py-2 flex justify-center items-center gap-1.5 rounded-xl bg-violet-500/[0.06] hover:bg-violet-500/[0.14] text-violet-400 hover:text-violet-300 transition-all duration-200 border border-violet-500/[0.08] hover:border-violet-500/[0.25] text-[11px] font-medium"
                          title="Open Documents"
                        >
                          <FileText className="w-3 h-3" />
                          Documents
                        </button>
                        <button
                          onClick={() => openProgressModal(c)}
                          className="py-2 flex justify-center items-center gap-1.5 rounded-xl bg-emerald-500/[0.06] hover:bg-emerald-500/[0.14] text-emerald-400 hover:text-emerald-300 transition-all duration-200 border border-emerald-500/[0.08] hover:border-emerald-500/[0.25] text-[11px] font-medium"
                          title="Update Progress"
                        >
                          <FolderKanban className="w-3 h-3" />
                          Progress
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          CROP MODAL
         ════════════════════════════════════════════ */}
      {cropModalOpen && cropImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => { setCropModalOpen(false); setCropImage(null); }}
          />
          <div className="relative bg-[#111111] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] w-[90vw] max-w-[480px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Crop Profile Photo</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Drag to reposition, scroll to zoom</p>
              </div>
              <button
                onClick={() => { setCropModalOpen(false); setCropImage(null); }}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
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
                    border: "2px solid rgba(16, 185, 129, 0.5)",
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
                  className="flex-1 h-1.5 rounded-full appearance-none bg-zinc-800 accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(16,185,129,0.4)] [&::-webkit-slider-thumb]:cursor-pointer"
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
                disabled={uploadingAdmin}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-2"
              >
                {uploadingAdmin ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  "Save Photo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TOAST
         ════════════════════════════════════════════ */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] border flex items-center gap-3 transition-all duration-300 ${toast.type === "success" ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-400" : "bg-red-950/90 border-red-500/20 text-red-400"}`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PROGRESS MODAL
         ════════════════════════════════════════════ */}
      {progressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-[family-name:var(--font-body)]">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setProgressModalOpen(false)}
          />
          <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] w-[90vw] max-w-[420px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Update Project Progress</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Select the current stage of this project</p>
              </div>
              <button
                onClick={() => setProgressModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-6 border-b border-white/[0.06]">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Progress Stage
              </label>
              <select
                className="w-full bg-[#050505] text-white border border-white/[0.1] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
              >
                {STAGES.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Actions */}
            <div className="px-6 py-5 bg-[#080808] flex items-center justify-end gap-3">
              <button
                onClick={() => setProgressModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                disabled={savingProgress}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                {savingProgress ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          DOCUMENTS WORKSPACE MODAL
         ════════════════════════════════════════════ */}
      {docsModalOpen && activeCustomerId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-[family-name:var(--font-body)] p-4 sm:p-6 lg:p-8">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setDocsModalOpen(false)}
          />
          <div className="relative bg-[#050505] border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] w-full h-full max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-end px-4 py-3 bg-[#050505]/90 backdrop-blur flex-shrink-0 border-b border-white/[0.06]">
              <button
                onClick={() => setDocsModalOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
              >
                <X className="w-4 h-4" />
                Close Workspace
              </button>
            </div>
            <div className="flex-1 w-full overflow-x-hidden overflow-y-auto">
              {(() => {
                const customer = customers.find(c => c.id === activeCustomerId);
                return (
                  <AdminDocumentsWorkspace
                    projectId={activeCustomerId}
                    projectTitle={customer?.project_title || ""}
                    studentName={customer?.name || ""}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
