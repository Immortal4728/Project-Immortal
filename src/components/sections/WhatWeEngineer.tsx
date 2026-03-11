"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    Server,
    Key,
    Layers,
    Database,
    Terminal,
    Activity,
} from "lucide-react";

const tasks = [
    {
        title: "Microservices Architecture",
        subtitle: "Isolated, fault-tolerant services",
        icon: <Server className="w-6 h-6 text-zinc-300" />,
    },
    {
        title: "API Gateway & Identity",
        subtitle: "JWT auth & one entry point",
        icon: <Key className="w-6 h-6 text-zinc-300" />,
    },
    {
        title: "Full Stack Engineering",
        subtitle: "Next.js, Tailwind, React Query",
        icon: <Layers className="w-6 h-6 text-zinc-300" />,
    },
    {
        title: "Database Architecture",
        subtitle: "PostgreSQL, MongoDB, Redis",
        icon: <Database className="w-6 h-6 text-zinc-300" />,
    },
    {
        title: "DevOps & Deployment",
        subtitle: "Docker & GitHub Actions CI/CD",
        icon: <Terminal className="w-6 h-6 text-zinc-300" />,
    },
    {
        title: "Build Tracking",
        subtitle: "Commit-level visibility & logs",
        icon: <Activity className="w-6 h-6 text-zinc-300" />,
    },
];

export default function GrowthStory() {
    return (
        <section className="relative w-full py-32 px-6 md:px-12 bg-black text-white font-[family-name:var(--font-heading)] overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">

                {/* LEFT SIDE - Task Loop with Vertical Bar */}
                <div className="relative w-full max-w-lg mx-auto lg:mx-0">
                    <Card className="overflow-hidden border-zinc-800/80 bg-zinc-950/50 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.03)] rounded-3xl">
                        <CardContent className="relative h-[480px] p-0 overflow-hidden">
                            {/* Scrollable Container */}
                            <div className="relative h-full overflow-hidden">
                                {/* Motion list */}
                                <motion.div
                                    className="flex flex-col gap-0 absolute w-full"
                                    animate={{ y: ["0%", "-50%"] }}
                                    transition={{
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        duration: 24,
                                        ease: "linear",
                                    }}
                                >
                                    {[...tasks, ...tasks].map((task, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-5 px-8 py-6 border-b border-white/5 relative hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Icon + Content */}
                                            <div className="flex items-center justify-between flex-1">
                                                <div className="flex items-center gap-5">
                                                    <div className="bg-zinc-900 border border-zinc-800 flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg">
                                                        {task.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg md:text-xl font-bold text-zinc-100">{task.title}</p>
                                                        <p className="text-sm text-zinc-400 mt-1 font-[family-name:var(--font-body)]">{task.subtitle}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Fade effect only inside card */}
                                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10" />
                                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT SIDE - Content */}
                <div className="space-y-10 lg:pl-10">
                    <div className="inline-flex">
                        <Badge variant="outline" className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300 border-zinc-800 bg-zinc-900/40">
                            Capabilities
                        </Badge>
                    </div>

                    <h3 className="text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-bold tracking-[-0.02em] leading-[1.05] bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                        What we engineer.
                        <span className="block mt-6 text-zinc-400 text-lg sm:text-xld lg:text-2xl font-normal leading-relaxed max-w-xl font-[family-name:var(--font-body)]">
                            Each capability is a precision instrument — not a feature list, but a craft we have refined through real projects. From microservices to seamless deployments, we build for immortal scale.
                        </span>
                    </h3>

                    <div className="flex gap-4 flex-wrap pt-6 font-[family-name:var(--font-body)]">
                        <Badge className="px-5 py-2.5 text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors">Production Ready</Badge>
                        <Badge className="px-5 py-2.5 text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors">Secure Architecture</Badge>
                        <Badge className="px-5 py-2.5 text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors">Zero-downtime</Badge>
                    </div>
                </div>
            </div>
        </section>
    );
}