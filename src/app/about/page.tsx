"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Server, Lock, Box, Cloud, Code2, Activity,
    Zap, Github, Linkedin, User, ArrowRight, Circle,
} from "lucide-react";
import { slideLeft, slideRight, SectionHeading, SectionTag } from "./components";

/* ── simple fade-in preset ── */
const fade = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
};

export default function AboutPage() {
    return (
        <div className="bg-black text-white min-h-screen font-[family-name:var(--font-heading)] selection:bg-white/20">

            {/* ══════════════════════ HERO ══════════════════════ */}
            <section className="relative z-10 pt-36 pb-24 px-6 max-w-4xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 font-medium tracking-widest mb-8">
                        PROJECT IMMORTAL
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-[1.08] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-8">
                        Engineering Systems for the Real World
                    </h1>
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-lg md:text-xl text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed max-w-3xl mx-auto">
                    A full-stack production-ready platform built to demonstrate uncompromising
                    reliability, seamless scalability, and real-world deployment focus. We don&apos;t build demos —
                    we architect infrastructure that performs under load.
                </motion.p>
            </section>


            {/* ══════════════════════ SYSTEM FLOW ══════════════════════ */}
            <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
                <motion.div variants={fade} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }} className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">System Architecture Flow</h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">The step-by-step lifecycle of data through the Immortal ecosystem.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {([
                        { step: "01", title: "Submit Data", desc: "User pushes payload via client application." },
                        { step: "02", title: "Persist", desc: "Backend API routes ingest and store in PostgreSQL." },
                        { step: "03", title: "Admin Review", desc: "RBAC systems grant admin approval capabilities." },
                        { step: "04", title: "Provision", desc: "Secure credentials minted & emails dispatched." },
                    ] as const).map((item, i) => (
                        <motion.div key={i} variants={fade} initial="hidden" whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }} custom={i}
                            className="bg-zinc-950 border border-zinc-800/70 rounded-2xl p-6 hover:border-zinc-700 transition-colors duration-300">
                            <div className="text-4xl font-black text-zinc-800 mb-3 select-none">{item.step}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-zinc-400 text-sm font-[family-name:var(--font-body)] leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════ TECH STACK — ENHANCED ══════════════════════ */}
            <section className="w-full relative z-10 overflow-hidden">
                {/* Background grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />
                {/* Soft ambient glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/[0.03] via-blue-500/[0.04] to-cyan-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-24 md:py-32 relative">
                    <SectionHeading tag="Infrastructure" title="The Tech Stack" subtitle="Built on modern, high-performance infrastructure." />

                    <div className="max-w-5xl mx-auto space-y-20">

                        {/* ── Row 1: Frontend ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div variants={slideLeft} initial="hidden" whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <SectionTag label="Frontend" />
                                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/70 font-medium tracking-wide">
                                        <Circle className="w-1.5 h-1.5 fill-emerald-400/70 animate-pulse" /> Real-time Sync
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Client-Side Architecture</h3>
                                <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed mb-3">
                                    A reactive, component-driven frontend built for speed, accessibility, and seamless user experience across all devices.
                                </p>
                                <p className="text-zinc-500 text-xs font-mono mb-6 tracking-wide">SSR + API integration for optimized performance</p>
                                <div className="flex flex-wrap gap-3">
                                    {["Next.js & React", "Tailwind CSS", "Framer Motion"].map((t, j) => (
                                        <motion.span key={j} whileHover={{ scale: 1.06, y: -2 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-sm text-zinc-300 backdrop-blur-sm hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] hover:bg-zinc-800/40 transition-all duration-300 cursor-default">
                                            <Code2 className="w-3.5 h-3.5 text-zinc-500" />{t}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={slideRight} initial="hidden" whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}
                                className="hidden lg:flex items-center justify-center">
                                <div className="relative w-64 h-64">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/[0.06] to-blue-500/[0.06] blur-3xl" />
                                    <div className="absolute inset-4 rounded-full border border-zinc-800/40 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm">
                                        <Code2 className="w-14 h-14 text-zinc-700" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800/30 animate-[spin_30s_linear_infinite]" />
                                    <div className="absolute inset-2 rounded-full border border-zinc-800/15 animate-[spin_45s_linear_infinite_reverse]" />
                                    {/* Activity node */}
                                    <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-purple-400/40 animate-pulse" />
                                    <div className="absolute bottom-6 left-4 w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-pulse" style={{ animationDelay: "1s" }} />
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Row 2: Backend (INVERTED) ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div variants={slideLeft} initial="hidden" whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}
                                className="hidden lg:flex items-center justify-center order-1 lg:order-none">
                                <div className="relative w-64 h-64">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/[0.06] to-cyan-500/[0.06] blur-3xl" />
                                    <div className="absolute inset-4 rounded-full border border-zinc-800/40 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm">
                                        <Server className="w-14 h-14 text-zinc-700" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800/30 animate-[spin_25s_linear_infinite_reverse]" />
                                    <div className="absolute inset-2 rounded-full border border-zinc-800/15 animate-[spin_40s_linear_infinite]" />
                                    <div className="absolute top-6 left-2 w-2 h-2 rounded-full bg-blue-400/40 animate-pulse" />
                                    <div className="absolute bottom-4 right-6 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" style={{ animationDelay: "0.7s" }} />
                                </div>
                            </motion.div>
                            <motion.div variants={slideRight} initial="hidden" whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <SectionTag label="Backend" />
                                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/70 font-medium tracking-wide">
                                        <Circle className="w-1.5 h-1.5 fill-emerald-400/70 animate-pulse" /> Live API
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Server & Data Layer</h3>
                                <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed mb-3">
                                    API-first backend with PostgreSQL persistence, deployed on edge infrastructure for minimal latency worldwide.
                                </p>
                                <p className="text-zinc-500 text-xs font-mono mb-6 tracking-wide">Edge-deployed APIs with sub-100ms latency</p>
                                <div className="flex flex-wrap gap-3">
                                    {["Next.js API Routes", "Insforge DB (PostgreSQL)", "Vercel Deployment"].map((t, j) => (
                                        <motion.span key={j} whileHover={{ scale: 1.06, y: -2 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-sm text-zinc-300 backdrop-blur-sm hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] hover:bg-zinc-800/40 transition-all duration-300 cursor-default">
                                            <Server className="w-3.5 h-3.5 text-zinc-500" />{t}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Row 3: Auth & Infra ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div variants={slideLeft} initial="hidden" whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <SectionTag label="Infrastructure" />
                                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/70 font-medium tracking-wide">
                                        <Circle className="w-1.5 h-1.5 fill-emerald-400/70 animate-pulse" /> Active Connections
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Auth & Services</h3>
                                <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed mb-3">
                                    Production-grade authentication, scalable object storage, and automated communication pipelines.
                                </p>
                                <p className="text-zinc-500 text-xs font-mono mb-6 tracking-wide">Secure auth with token validation & role-based access</p>
                                <div className="flex flex-wrap gap-3">
                                    {["Firebase Authentication", "Insforge Storage Buckets", "Gmail SMTP Automation"].map((t, j) => (
                                        <motion.span key={j} whileHover={{ scale: 1.06, y: -2 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-sm text-zinc-300 backdrop-blur-sm hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] hover:bg-zinc-800/40 transition-all duration-300 cursor-default">
                                            <Lock className="w-3.5 h-3.5 text-zinc-500" />{t}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={slideRight} initial="hidden" whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}
                                className="hidden lg:flex items-center justify-center">
                                <div className="relative w-64 h-64">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/[0.06] to-emerald-500/[0.06] blur-3xl" />
                                    <div className="absolute inset-4 rounded-full border border-zinc-800/40 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm">
                                        <Lock className="w-14 h-14 text-zinc-700" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800/30 animate-[spin_35s_linear_infinite]" />
                                    <div className="absolute inset-2 rounded-full border border-zinc-800/15 animate-[spin_50s_linear_infinite_reverse]" />
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400/40 animate-pulse" />
                                    <div className="absolute bottom-8 left-6 w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: "1.3s" }} />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* ── System Flow Connector ── */}
                    <motion.div variants={fade} initial="hidden" whileInView="visible"
                        viewport={{ once: true, margin: "-40px" }}
                        className="max-w-3xl mx-auto mt-24">
                        <div className="flex items-center justify-center gap-0 text-xs font-mono text-zinc-500">
                            {["User", "Frontend", "API", "Database", "Response"].map((label, i) => (
                                <React.Fragment key={label}>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                                        <span className="text-zinc-500 tracking-wide">{label}</span>
                                    </div>
                                    {i < 4 && (
                                        <div className="flex-1 min-w-[40px] max-w-[80px] flex items-center justify-center -mt-4">
                                            <div className="w-full h-px bg-zinc-800 relative">
                                                <motion.div
                                                    className="absolute top-0 left-0 h-px w-3 bg-zinc-600"
                                                    animate={{ x: [0, 60, 0] }}
                                                    transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ══════════════════════ CORE PRINCIPLES ══════════════════════ */}
            <section className="relative z-10 py-28 px-6 max-w-4xl mx-auto">
                <motion.div variants={fade} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }} className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Core Engineering Principles</h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">The non-negotiable standards behind every line of code.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {([
                        { icon: Zap, title: "Scalable Architecture", desc: "Systems designed for horizontal scaling, stateless APIs, and efficient database queries that handle growth without rewrites." },
                        { icon: Activity, title: "Reliability Under Load", desc: "Built with failure handling, retries, and safeguards to maintain stability under heavy traffic and concurrent requests." },
                        { icon: Box, title: "Clean System Design", desc: "Modular structure, clear separation of concerns, and maintainable code practices across every layer of the stack." },
                        { icon: Cloud, title: "Production Deployment", desc: "Designed for real environments with monitoring, logging, and performance optimization — not just localhost demos." },
                    ] as const).map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div key={i} variants={fade} initial="hidden" whileInView="visible"
                                viewport={{ once: true }} custom={i}
                                className="flex gap-5 p-6 bg-zinc-900/30 border border-zinc-800/60 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-300">
                                <div className="shrink-0 h-11 w-11 rounded-lg bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center mt-0.5">
                                    <Icon className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <strong className="text-white block mb-1.5 text-[15px] tracking-tight">{p.title}</strong>
                                    <p className="text-zinc-400 text-sm font-[family-name:var(--font-body)] leading-relaxed">{p.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ══════════════════════ DEVELOPER ══════════════════════ */}
            <section className="relative z-10 pt-28 pb-24 px-6 max-w-4xl mx-auto">
                <div className="border-t border-zinc-800/40 pt-20" />
                <motion.div variants={fade} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="flex flex-col md:flex-row items-center md:items-start gap-12">

                    <div className="shrink-0 group">
                        <Avatar className="h-36 w-36 md:h-44 md:w-44 border border-zinc-700/50 shadow-xl group-hover:shadow-2xl transition-shadow duration-300 relative z-10">
                            <AvatarImage src="/04.jpeg" alt="Rishi Chowdary" className="object-cover" />
                            <AvatarFallback className="bg-zinc-800 text-4xl font-bold">RC</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="text-center md:text-left space-y-5 flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <p className="text-sm text-zinc-500 font-medium tracking-widest uppercase">About the Developer</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-400 font-medium">
                                <User className="w-3 h-3" /> Lead Engineer & Architect
                            </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Rishi Chowdary</h3>
                        <p className="text-lg text-zinc-300 font-medium">Full-Stack Engineer</p>
                        <div className="space-y-4 pt-1">
                            <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed max-w-2xl">
                                I design and build full-stack systems that are meant to perform under real-world conditions, not just demonstrations. My focus is on backend reliability, scalable architecture, and clean API design.
                            </p>
                            <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed max-w-2xl">
                                Project Immortal was built end-to-end — from database schema to deployment — with an emphasis on performance, automation, and production readiness. Every feature reflects practical engineering decisions rather than theoretical implementations.
                            </p>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-5">
                            {([
                                { href: "https://github.com/immortal4728", icon: Github, label: "GitHub" },
                                { href: "https://www.linkedin.com/in/immortal4728/", icon: Linkedin, label: "LinkedIn" },
                            ] as const).map((link) => {
                                const Icon = link.icon;
                                return (
                                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300 border border-zinc-800 hover:border-zinc-600 rounded-full px-5 py-2.5 bg-zinc-900/50 hover:shadow-lg hover:shadow-black/30">
                                        <Icon className="w-4 h-4" /> {link.label}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </section>

        </div>
    );
}
