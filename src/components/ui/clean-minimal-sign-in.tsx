"use client"

import * as React from "react"
import { useState } from "react";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";

interface SignIn2Props {
    onSignIn?: (email: string, password: string) => void | Promise<void>;
    loading?: boolean;
    error?: string;
}

const SignIn2 = ({ onSignIn, loading = false, error: externalError }: SignIn2Props) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const displayError = externalError || error;

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSignIn = () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError("");
        if (onSignIn) {
            onSignIn(email, password);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSignIn();
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] z-[1] relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-blue-900/8 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative w-full max-w-sm bg-gradient-to-b from-zinc-800/60 to-zinc-900/80 rounded-3xl shadow-2xl shadow-black/40 p-8 flex flex-col items-center border border-white/10 backdrop-blur-md">
                {/* Logo - circle with company logo */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900 mb-6 shadow-lg shadow-black/20 overflow-hidden border border-white/10">
                    <Image
                        src="/company-logo.png"
                        alt="Project Immortal Logo"
                        width={56}
                        height={56}
                        className="object-cover scale-[1.15]"
                    />
                </div>

                <h2 className="text-2xl font-semibold mb-2 text-center text-white">
                    Employee Portal
                </h2>
                <p className="text-zinc-400 text-sm mb-6 text-center">
                    Access your workspace, manage projects, and collaborate with your team
                </p>

                <div className="w-full flex flex-col gap-3 mb-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Mail className="w-4 h-4" />
                        </span>
                        <input
                            placeholder="Email"
                            type="email"
                            value={email}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 bg-black/40 text-white placeholder-zinc-600 text-sm transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="email"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Lock className="w-4 h-4" />
                        </span>
                        <input
                            placeholder="Password"
                            type="password"
                            value={password}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 bg-black/40 text-white placeholder-zinc-600 text-sm transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="current-password"
                        />
                    </div>

                    {displayError && (
                        <div className="text-sm text-red-400 text-left">{displayError}</div>
                    )}
                </div>

                <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full bg-gradient-to-b from-white to-zinc-200 text-black font-medium py-2.5 rounded-xl shadow-lg shadow-white/5 hover:brightness-95 cursor-pointer transition mb-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-black animate-spin" />
                            Authenticating...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>

                <div className="w-full text-center mt-2 border-t border-white/5 pt-4">
                    <span className="text-xs text-zinc-500">
                        Contact the system administrator if you need access.
                    </span>
                </div>
            </div>
        </div>
    );
};

export { SignIn2 };
