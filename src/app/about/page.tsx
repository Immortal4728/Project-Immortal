"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
    return (
        <div className="bg-black text-white min-h-screen flex flex-col font-[family-name:var(--font-heading)] selection:bg-white/20">
            <main className="flex-grow flex flex-col items-center pt-32 pb-24 px-6 md:px-12 lg:px-16 w-full max-w-7xl mx-auto space-y-24">

                {/* 1. HERO STATEMENT */}
                <section className="text-center space-y-8 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-[1.08] transform-gpu bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent"
                    >
                        About Project Immortal
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="space-y-6 text-lg md:text-xl text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed"
                    >
                        <p>
                            Project Immortal is an engineering studio dedicated to building software systems designed to survive real-world scale.
                        </p>
                        <p>
                            While many projects stop at the prototype stage, our focus is on transforming ideas into production-ready systems — software that performs reliably under real usage, real data, and real operational demands.
                        </p>
                        <p>
                            We work at the intersection of full-stack engineering, scalable system design, and modern deployment architecture to help founders and ambitious builders turn concepts into durable digital infrastructure.
                        </p>
                    </motion.div>
                </section>

                {/* 2. OUR PHILOSOPHY */}
                <section className="w-full max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="p-8 md:p-12 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-sm"
                    >
                        <h2 className="text-3xl font-bold text-white mb-6 tracking-tight text-center">Engineering Over Prototypes</h2>
                        <div className="space-y-6 text-zinc-300 text-lg md:text-xl font-[family-name:var(--font-body)] leading-relaxed">
                            <p className="text-center">
                                Most academic and early-stage software fails because it is built to demonstrate functionality rather than sustain real-world use.
                            </p>
                            <p className="text-center">
                                At Project Immortal, we approach every build with a systems mindset.
                            </p>
                            <div className="mt-8">
                                <p className="text-white font-semibold mb-4 text-center">Our philosophy centers around:</p>
                                <ul className="space-y-4 text-zinc-400 text-left md:text-center inline-block w-full">
                                    <li className="flex items-start md:items-center justify-start md:justify-center gap-4">
                                        <span className="text-zinc-500 font-bold mt-1 md:mt-0">•</span>
                                        <span><strong className="text-zinc-200">Scalable Architecture</strong> — systems designed to grow with real demand</span>
                                    </li>
                                    <li className="flex items-start md:items-center justify-start md:justify-center gap-4">
                                        <span className="text-zinc-500 font-bold mt-1 md:mt-0">•</span>
                                        <span><strong className="text-zinc-200">Production Reliability</strong> — infrastructure that performs under pressure</span>
                                    </li>
                                    <li className="flex items-start md:items-center justify-start md:justify-center gap-4">
                                        <span className="text-zinc-500 font-bold mt-1 md:mt-0">•</span>
                                        <span><strong className="text-zinc-200">Clean Engineering</strong> — maintainable code and structured system design</span>
                                    </li>
                                    <li className="flex items-start md:items-center justify-start md:justify-center gap-4">
                                        <span className="text-zinc-500 font-bold mt-1 md:mt-0">•</span>
                                        <span><strong className="text-zinc-200">Real Deployment</strong> — software that runs in real environments, not just demonstrations</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* 3. FOUNDERS */}
                <section className="w-full max-w-5xl mx-auto space-y-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold text-center tracking-[-0.02em] leading-[1.08] transform-gpu bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent"
                    >
                        The Founders
                    </motion.h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* FOUNDER 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full"
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 h-full backdrop-blur-sm hover:bg-zinc-900/80 hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-500 overflow-hidden group">
                                <CardHeader className="flex flex-col items-center text-center gap-6 pt-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors duration-500" />
                                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-zinc-700/50 shadow-2xl shadow-black/50 relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                                            <AvatarImage src="/04.jpeg" alt="Conan" className="object-cover" />
                                            <AvatarFallback className="bg-zinc-800 text-3xl font-bold">C</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-3xl font-bold text-white tracking-tight">Rishi Chowdary</CardTitle>
                                        <CardDescription className="text-zinc-400 text-lg font-[family-name:var(--font-body)]">Founder & Lead Full-Stack Engineer</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-10 space-y-8 mt-2">
                                    <p className="text-zinc-300 font-[family-name:var(--font-body)] leading-relaxed text-center text-base md:text-lg">
                                        Rishi leads the engineering direction of Project Immortal, focusing on designing scalable full-stack systems and guiding projects from concept to production deployment. His work centers on bridging the gap between academic development and real-world software engineering.
                                    </p>
                                    <div className="bg-black/30 rounded-xl p-6 border border-zinc-800/50">
                                        <h4 className="text-white font-semibold mb-4 tracking-tight">Expertise:</h4>
                                        <ul className="space-y-3 text-zinc-400 font-[family-name:var(--font-body)]">
                                            <li className="flex items-center gap-3"><span className="text-zinc-500 text-xl font-bold leading-none mt-[-2px]">•</span> Full-Stack Architecture</li>
                                            <li className="flex items-center gap-3"><span className="text-zinc-500 text-xl font-bold leading-none mt-[-2px]">•</span> Production Deployments</li>
                                            <li className="flex items-center gap-3"><span className="text-zinc-500 text-xl font-bold leading-none mt-[-2px]">•</span> System Design</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* FOUNDER 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full"
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 h-full backdrop-blur-sm hover:bg-zinc-900/80 hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-500 overflow-hidden group">
                                <CardHeader className="flex flex-col items-center text-center gap-6 pt-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors duration-500" />
                                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-zinc-700/50 shadow-2xl shadow-black/50 relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                                            <AvatarImage src="/bharath.png" alt="Bharath" className="object-cover" />
                                            <AvatarFallback className="bg-zinc-800 text-3xl font-bold">B</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-3xl font-bold text-white tracking-tight">Bharath</CardTitle>
                                        <CardDescription className="text-zinc-400 text-lg font-[family-name:var(--font-body)]">Co-Founder & Database Architect</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-10 space-y-8 mt-2">
                                    <p className="text-zinc-300 font-[family-name:var(--font-body)] leading-relaxed text-center text-base md:text-lg">
                                        Bharath specializes in designing robust data architectures and optimizing backend systems for performance and reliability. His focus is building database infrastructures capable of supporting complex and scalable applications.
                                    </p>
                                    <div className="bg-black/30 rounded-xl p-6 border border-zinc-800/50">
                                        <h4 className="text-white font-semibold mb-4 tracking-tight">Expertise:</h4>
                                        <ul className="space-y-3 text-zinc-400 font-[family-name:var(--font-body)]">
                                            <li className="flex items-center gap-3"><span className="text-zinc-500 text-xl font-bold leading-none mt-[-2px]">•</span> Database Architecture</li>
                                            <li className="flex items-center gap-3"><span className="text-zinc-500 text-xl font-bold leading-none mt-[-2px]">•</span> Data Performance Optimization</li>
                                            <li className="flex items-center gap-3"><span className="text-zinc-500 text-xl font-bold leading-none mt-[-2px]">•</span> Backend Infrastructure</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>

                {/* COMPANY INFO SECTIONS */}
                <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                    {/* 4. WHAT WE DO */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full"
                    >
                        <Card className="bg-zinc-900/30 border-zinc-800/50 h-full hover:bg-zinc-900/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white tracking-tight">What We Do</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                                    Project Immortal builds real software systems rather than simple academic demos. We help students and clients build scalable applications using modern technologies, strong backend architecture, and production deployment strategies.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 5. MISSION */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-full"
                    >
                        <Card className="bg-zinc-900/30 border-zinc-800/50 h-full hover:bg-zinc-900/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white tracking-tight">Our Mission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                                    Our mission is to bridge the gap between academic software projects and real-world engineering by designing scalable systems and guiding projects from idea to production.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 6. VISION */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full"
                    >
                        <Card className="bg-zinc-900/30 border-zinc-800/50 h-full hover:bg-zinc-900/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white tracking-tight">Our Vision</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400 font-[family-name:var(--font-body)] leading-relaxed">
                                    Project Immortal aims to grow into a specialized engineering studio focused on backend systems, scalable architectures, and cloud-native software development.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
