"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ================= MAGNETIC BUTTON ================= */

const MagneticButton = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { width, height, left, top } = ref.current.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.3, y: y * 0.3 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};



/* ================= HERO ================= */

export function Web3HeroAnimated() {
    const typeText = "We engineer software that survives reality.";
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        let i = 0;
        let interval: ReturnType<typeof setInterval>;

        const startTimeout = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText(typeText.slice(0, i + 1));
                i++;
                if (i === typeText.length) clearInterval(interval);
            }, 80);
        }, 400);

        return () => {
            clearTimeout(startTimeout);
            if (interval) clearInterval(interval);
        };
    }, []);

    const pillars = [92, 84, 78, 70, 62, 54, 46, 34, 18, 34, 46, 54, 62, 70, 78, 84, 92];
    const [isMounted, setIsMounted] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    // Cursor-based parallax
    const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

    const { scrollY } = useScroll();
    const yParallax = useTransform(scrollY, [0, 800], [0, 250]);
    const opacityParallax = useTransform(scrollY, [0, 500], [1, 0]);
    const glowY = useTransform(scrollY, [0, 800], [0, 150]);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!heroRef.current) return;
            const { width, height } = heroRef.current.getBoundingClientRect();
            const x = (e.clientX - width / 2) / width;
            const y = (e.clientY - height / 2) / height;
            mouseX.set(x * 12);   // slightly increased for more dramatic feel
            mouseY.set(y * 12);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const navItems = [
        { name: "Home", href: "/#home" },
        { name: "Services", href: "/#growthstory" },
        { name: "Projects", href: "/#services" },
        { name: "About", href: "/about" },
        { name: "Why Us", href: "/why-us" },
        { name: "Contact", href: "/#contact" }
    ];

    return (
        <>


            <section
                ref={heroRef}
                className="relative h-screen overflow-hidden bg-transparent text-white font-[family-name:var(--font-heading)]"
            >
                {/* ================= BACKGROUND ================= */}

                {/* NAVBAR MOVED OUTSIDE SECTION */}
                {/* ================= HERO CONTENT ================= */}

                <motion.div
                    style={{ y: yParallax, opacity: opacityParallax }}
                    className="relative z-10 mx-auto max-w-5xl text-center px-6 pt-32 pb-48 h-full flex flex-col justify-center"
                >
                    <motion.div
                        style={{ x: mouseX, y: mouseY }}
                        className="flex flex-col items-center gap-6"
                    >
                        {/* Live Green Dot Tag */}
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="group relative inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 text-xs font-medium tracking-wide text-white/70 ring-1 ring-white/10 backdrop-blur cursor-pointer font-[family-name:var(--font-body)]"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-300 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] group-hover:scale-125 transition-transform duration-300"></span>
                            </span>
                            Project Immortal Studio
                        </motion.span>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.02em] leading-[1.02] bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent min-h-[120px] sm:min-h-[144px] lg:min-h-[196px]">
                            {displayText.substring(0, 20)}
                            <br />
                            <span className="bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 bg-clip-text text-transparent">
                                {displayText.substring(21)}
                            </span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.4 }}
                            className="mx-auto max-w-2xl text-white/60 text-lg md:text-xl font-[family-name:var(--font-body)] leading-relaxed"
                        >
                            Turning capstones into production systems, demonstrating deep technical architecture, and shipping scalable foundations for serious founders.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.6 }}
                            className="mt-8 flex flex-wrap justify-center gap-5"
                        >
                            <MagneticButton>
                                <a href="#contact" className="group relative rounded-[2rem] bg-white px-8 py-4 text-base font-bold text-black hover:bg-zinc-200 transition shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.35)] active:scale-95 inline-block transform transition-all duration-300">
                                    Start Your Project
                                </a>
                            </MagneticButton>

                            <MagneticButton>
                                <a href="#architecture" className="group relative rounded-[2rem] border border-zinc-800 bg-zinc-950/50 px-8 py-4 text-base font-bold text-white hover:bg-zinc-900 transition active:scale-95 inline-block transform transition-all duration-300 shadow-xl shadow-transparent hover:shadow-white/5 backdrop-blur-md">
                                    View Architecture
                                </a>
                            </MagneticButton>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* ================= PILLARS ================= */}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[54vh]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-[1px]">
                        {pillars.map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-white/10 to-transparent transition-all duration-1000"
                                style={{
                                    height: isMounted ? `${h}%` : "0%",
                                    transitionDelay: `${Math.abs(i - 8) * 60}ms`,
                                }}
                            />
                        ))}
                    </div>
                </div>


            </section>
        </>
    );
}