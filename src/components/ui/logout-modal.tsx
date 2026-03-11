"use client";

import React, { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            >
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                        <LogOut className="w-6 h-6 text-rose-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-heading)]">
                        Sign out of Project Immortal?
                    </h3>
                    <p className="text-zinc-400 text-sm font-[family-name:var(--font-body)] leading-relaxed">
                        You will be logged out of your current session. You'll need to sign back in to access your portal.
                    </p>
                </div>

                <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-end gap-3 font-[family-name:var(--font-body)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors focus:outline-none focus:ring-2 focus:ring-white/[0.2]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
