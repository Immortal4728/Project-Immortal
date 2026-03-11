"use client";

import React, { useState, useEffect } from "react";
import { ShaderAnimation } from "@/components/ui/shader-animation";

export default function LoadingScreen({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for 3.5 seconds
        const t = setTimeout(() => { setLoading(false); }, 3500);
        return () => clearTimeout(t);
    }, []);

    if (loading) {
        return (
            <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
                <ShaderAnimation />
                <span className="absolute pointer-events-none z-10 text-center text-5xl md:text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white drop-shadow-lg">
                    PROJECT IMMORTAL
                </span>
            </div>
        );
    }

    return <>{children}</>;
}
