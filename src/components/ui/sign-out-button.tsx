"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LogoutModal } from "@/components/ui/logout-modal";

export function SignOutButton() {
    const router = useRouter();
    const [showLogout, setShowLogout] = useState(false);

    const handleConfirmLogout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        sessionStorage.clear();

        await fetch("/api/logout", { method: "POST" });

        window.location.href = "/";
    };

    return (
        <>
            <button
                onClick={() => setShowLogout(true)}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors font-[family-name:var(--font-body)]"
            >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
            </button>

            <LogoutModal
                isOpen={showLogout}
                onClose={() => setShowLogout(false)}
                onConfirm={handleConfirmLogout}
            />
        </>
    );
}
