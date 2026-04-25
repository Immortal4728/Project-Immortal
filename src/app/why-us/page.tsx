"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WhyUsPage() {
    return (
        <div className="bg-black text-white min-h-screen flex flex-col font-[family-name:var(--font-heading)] selection:bg-white/20">
            <main className="flex-grow flex flex-col items-center pt-32 pb-24 px-6 md:px-12 lg:px-16 w-full max-w-7xl mx-auto space-y-24">

                {/* 1. HERO */}
                <section className="text-center space-y-6 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-[1.08] transform-gpu bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent"
                    >
                        Why Choose Project Immortal
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-xl md:text-2xl text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed"
                    >
                        Project Immortal builds production-grade systems instead of simple academic projects.
                    </motion.p>
                </section>

                {/* 2. CORE DIFFERENCES */}
                {/* Hidden on mobile */}
                <section className="hidden md:block w-full space-y-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold text-center tracking-[-0.02em] leading-[1.08] transform-gpu bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent"
                    >
                        Core Differences
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        {[
                            {
                                title: "Real Engineering Systems",
                                description: "Projects are built like real software products, not tutorial demos."
                            },
                            {
                                title: "Production Deployments",
                                description: "Applications are deployed and tested in real environments."
                            },
                            {
                                title: "Scalable Architecture",
                                description: "Systems are designed with clean backend architecture and scalability."
                            },
                            {
                                title: "Industry-Level Guidance",
                                description: "Students receive guidance similar to real engineering teams."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 * (i + 1) }}
                                className="h-full"
                            >
                                <Card className="bg-zinc-900/30 border-zinc-800/50 h-full hover:bg-zinc-900/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-white tracking-tight">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. HOW WE WORK */}
                <section className="w-full space-y-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold text-center tracking-[-0.02em] leading-[1.08] transform-gpu bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent"
                    >
                        How We Work
                    </motion.h2>

                    {/* Mobile flow version */}
                    <div className="block md:hidden space-y-8 pb-12 px-2">
                        {[
                            {
                                title: "Idea",
                                description: "We validate requirements and map out a clear specification before writing any code."
                            },
                            {
                                title: "Architecture",
                                description: "We design data models, APIs, and scalable infrastructure to ensure the foundation is robust."
                            },
                            {
                                title: "Production",
                                description: "We develop, test, and containerize the application for secure deployment into real environments."
                            }
                        ].map((item, i) => (
                            <div key={item.title} className="flex items-start gap-5 relative">
                                {/* Flow line connecting steps */}
                                {i !== 2 && (
                                    <div className="absolute top-10 left-4 w-[2px] h-full bg-zinc-800 -z-10" />
                                )}
                                <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white text-black font-bold text-sm z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                    {i + 1}
                                </div>
                                <div className="pt-1">
                                    <h3 className="font-bold text-white text-lg tracking-tight mb-1">{item.title}</h3>
                                    <p className="text-sm text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop version */}

                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                        {[
                            {
                                title: "Idea",
                                description: "We validate requirements and map out a clear specification before writing any code."
                            },
                            {
                                title: "Architecture",
                                description: "We design data models, APIs, and scalable infrastructure to ensure the foundation is robust."
                            },
                            {
                                title: "Production",
                                description: "We develop, test, and containerize the application for secure deployment into real environments."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 * (i + 3) }}
                                className="h-full"
                            >
                                <Card className="bg-zinc-900/30 border-zinc-800/50 h-full hover:bg-zinc-900/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-white tracking-tight">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. FINAL MESSAGE */}
                <section className="text-center space-y-6 max-w-3xl mx-auto pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
                            From Academic Coding to Real Engineering
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                            Project Immortal exists to help developers move away from simple academic tutorials and step boldly into the world of genuine engineering.
                        </p>
                    </motion.div>
                </section>

            </main>
        </div>
    );
}
