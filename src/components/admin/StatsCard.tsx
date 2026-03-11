import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass?: string;
    iconColorClass?: string;
}

export function StatsCard({ title, value, icon: Icon, colorClass = "text-white", iconColorClass = "text-zinc-400" }: StatsCardProps) {
    /* Derive glow color from icon color class */
    const glowColor = iconColorClass.includes('amber') ? 'from-amber-500/[0.08]'
        : iconColorClass.includes('emerald') ? 'from-emerald-500/[0.08]'
            : iconColorClass.includes('rose') ? 'from-rose-500/[0.08]'
                : iconColorClass.includes('indigo') ? 'from-indigo-500/[0.06]'
                    : 'from-zinc-500/[0.04]';

    const borderHoverColor = iconColorClass.includes('amber') ? 'hover:border-amber-500/15'
        : iconColorClass.includes('emerald') ? 'hover:border-emerald-500/15'
            : iconColorClass.includes('rose') ? 'hover:border-rose-500/15'
                : iconColorClass.includes('indigo') ? 'hover:border-indigo-500/15'
                    : 'hover:border-white/[0.1]';

    return (
        <div className={`group relative bg-zinc-900/70 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 ${borderHoverColor} hover:shadow-[0_8px_40px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 overflow-hidden font-[family-name:var(--font-body)]`}>
            {/* Ambient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} to-transparent opacity-100 pointer-events-none`} />

            <div className="relative flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase">{title}</span>
                    <div className={`p-2 rounded-xl bg-zinc-800/70 border border-white/[0.04] ${iconColorClass} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>
                <p className={`text-4xl font-bold tracking-tight ${colorClass} font-[family-name:var(--font-heading)]`}>{value}</p>
            </div>
        </div>
    );
}
