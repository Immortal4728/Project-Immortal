"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring } from "framer-motion";

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

export default function Navbar() {
    const navItems = [
        { name: "Home", href: "/#home" },
        { name: "Services", href: "/#growthstory" },
        { name: "Projects", href: "/#services" },
        { name: "About", href: "/about" },
        { name: "Why Us", href: "/why-us" },
        { name: "Contact", href: "/#contact" }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 font-[family-name:var(--font-heading)]">
            <div className="mx-auto max-w-7xl px-6 py-5">
                <div className="flex items-center justify-between rounded-full bg-black/50 backdrop-blur-2xl border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] px-8 py-4">
                    {/* Logo + Name */}
                    <div className="flex items-center gap-4">
                        <Image
                            src="/company-logo.png"
                            alt="Project Immortal"
                            width={40}
                            height={40}
                            className="drop-shadow-lg"
                        />
                        <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            Project Immortal
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-10 text-base font-medium text-white/80">
                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href}>
                                <motion.span
                                    className="relative cursor-pointer hover:text-white transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all hover:after:w-full"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {item.name}
                                </motion.span>
                            </Link>
                        ))}
                    </nav>

                    {/* Portal Buttons */}
                    <div className="flex items-center gap-3">
                        <MagneticButton>
                            <a
                                href="/student/login"
                                className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                            >
                                Student Login
                            </a>
                        </MagneticButton>
                        <MagneticButton>
                            <a
                                href="/employee/login"
                                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black border border-white/80 hover:bg-zinc-200 hover:border-white transition-all duration-300"
                            >
                                Employee Login
                            </a>
                        </MagneticButton>
                    </div>
                </div>
            </div>
        </header>
    );
}
