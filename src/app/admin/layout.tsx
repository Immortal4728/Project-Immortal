"use client";

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-white font-[family-name:var(--font-heading)] overflow-hidden">
            {/* Sidebar (Desktop = always visible, Mobile = drawer) */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Top Bar */}
            <div className="md:hidden flex flex-col fixed top-0 left-0 w-full z-40">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xs tracking-wider">PI</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">Project Immortal</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Admin Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-zinc-400 hover:text-white p-2.5 transition-colors rounded-lg hover:bg-white/5 active:bg-white/10"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#050505] pt-[60px] md:pt-0">
                <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 md:p-12 lg:p-16 font-[family-name:var(--font-body)]">
                    {children}
                </div>
            </main>
        </div>
    );
}
