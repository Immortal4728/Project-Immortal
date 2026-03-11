"use client";

import React from "react";

const items = [
    "Production Systems",
    "Microservices Architecture",
    "API Engineering",
    "Full Stack Development",
    "System Design",
    "DevOps & Deployment",
    "Auth & Identity Systems",
    "Project Immortal"
];

// Duplicate items to ensure seamless scrolling
const marqueeItems = [...items, ...items, ...items, ...items];

export default function TextMarquee() {
    return (
        <div className="overflow-hidden border-t border-white/10 py-[1.4rem] bg-white/[0.015]">
            <div className="flex w-max animate-[mq_30s_linear_infinite]">
                {marqueeItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-[0.7rem] px-8 font-mono text-[0.55rem] md:text-xs tracking-[0.18em] uppercase text-zinc-400 whitespace-nowrap"
                    >
                        {item}
                        <span className="text-[#b8f000]/40 text-[0.5rem] ml-1">✦</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
