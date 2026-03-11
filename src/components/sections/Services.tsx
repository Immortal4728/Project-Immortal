"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Layers, LineChart, ShieldCheck, Cpu, Smartphone } from "lucide-react";

const domains = [
    {
        icon: BrainCircuit,
        title: "Artificial Intelligence & Machine Learning",
        description: "Building intelligent systems including predictive models, computer vision, and real-world AI applications."
    },
    {
        icon: Layers,
        title: "Full Stack Development",
        description: "Designing scalable web applications with modern frontend frameworks, backend APIs, and database systems."
    },
    {
        icon: LineChart,
        title: "Data Science",
        description: "Creating data pipelines, statistical models, and analytical systems that transform data into insights."
    },
    {
        icon: ShieldCheck,
        title: "Cybersecurity",
        description: "Implementing secure authentication, vulnerability protection, and modern security architectures."
    },
    {
        icon: Cpu,
        title: "Internet of Things (IoT)",
        description: "Developing connected systems using sensors, embedded devices, and cloud integration."
    },
    {
        icon: Smartphone,
        title: "Android App Development",
        description: "Building high-performance Android applications with modern UI, APIs, and scalable mobile architecture."
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const
        }
    }
};

export default function Services() {
    return (
        <section className="relative w-full py-32 px-6 md:px-12 lg:px-16 bg-black font-[family-name:var(--font-heading)] border-t border-white/5 overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-zinc-900/30 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center flex flex-col items-center"
                >
                    <span className="inline-block px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 border border-zinc-800 bg-zinc-900/40 rounded-full mb-8">
                        Technical Expertise
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em] leading-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                        Core Engineering Domains
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-[family-name:var(--font-body)]">
                        We specialize in advanced technical disciplines, delivering production-ready solutions across the software and hardware spectrum.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                >
                    {domains.map((domain) => {
                        const Icon = domain.icon;

                        return (
                            <motion.div
                                key={domain.title}
                                variants={cardVariants}
                                whileHover={{ y: -6 }}
                                className="group relative p-8 md:p-10 rounded-3xl bg-zinc-900/20 backdrop-blur-sm border border-white/5 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-zinc-700 hover:bg-zinc-900/50"
                            >
                                {/* Background Gradient Shift on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 to-zinc-800/0 group-hover:from-zinc-800/20 group-hover:to-zinc-800/5 transition-colors duration-500" />

                                {/* Glowing border top effect on hover */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left text-transparent" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center mb-8 group-hover:border-white/20 group-hover:bg-zinc-800/80 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Icon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors duration-500" />
                                        </motion.div>
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">
                                        {domain.title}
                                    </h3>

                                    <p className="text-zinc-400 leading-relaxed font-[family-name:var(--font-body)] text-[15px]">
                                        {domain.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
