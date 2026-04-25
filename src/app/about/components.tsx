"use client";
import React, { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";

export const ease = [0.22, 0.03, 0.26, 1] as const;

export const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.65, delay: i * 0.12, ease },
    }),
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number = 0) => ({
        opacity: 1, scale: 1,
        transition: { duration: 0.55, delay: i * 0.1, ease },
    }),
};

export const slideLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
};

export const slideRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
};

/* ── GlowCard with cursor-follow radial glow ── */
export function GlowCard({ children, className = "", glowSize = 300 }: {
    children: React.ReactNode; className?: string; glowSize?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hover, setHover] = useState(false);

    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    }, []);

    const grad = hover
        ? `radial-gradient(${glowSize}px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.06), transparent 60%)`
        : "none";
    const borderGrad = hover
        ? `radial-gradient(${glowSize * 0.7}px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.14), transparent 60%)`
        : "none";

    return (
        <div ref={ref} onMouseMove={onMove} onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`relative rounded-2xl overflow-hidden group ${className}`}>
            <div className="pointer-events-none absolute -inset-px z-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: grad }} />
            <div className="pointer-events-none absolute -inset-px z-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: borderGrad,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude", WebkitMaskComposite: "xor", padding: "1px",
                }} />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/* ── Section wrapper with alternating bg tones ── */
export function Section({ children, className = "", tone = "default" }: {
    children: React.ReactNode; className?: string;
    tone?: "default" | "darker" | "subtle";
}) {
    const bg = tone === "darker" ? "bg-zinc-950/60" : tone === "subtle" ? "bg-zinc-900/20" : "";
    return (
        <section className={`w-full relative ${bg} ${className}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-24 md:py-32">
                {children}
            </div>
        </section>
    );
}

/* ── Animated section heading ── */
export function SectionTag({ label }: { label: string }) {
    return (
        <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-400 font-semibold tracking-widest uppercase mb-5">
            {label}
        </span>
    );
}

export function SectionHeading({ tag, title, subtitle }: {
    tag: string; title: string; subtitle: string;
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div ref={ref} variants={fadeUp} initial="hidden"
            animate={inView ? "visible" : "hidden"} className="text-center mb-20">
            <SectionTag label={tag} />
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">{title}</h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </motion.div>
    );
}
