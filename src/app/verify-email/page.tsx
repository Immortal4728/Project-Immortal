"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import Alert from "@/components/ui/alert";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [resendLoading, setResendLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const checkVerificationStatus = async () => {
        if (!auth.currentUser) {
            router.push("/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await reload(auth.currentUser);
            if (auth.currentUser.emailVerified) {
                setMessage("Email verified successfully! Redirecting...");
                setTimeout(() => {
                    router.push("/admin/dashboard");
                }, 2000);
            } else {
                setError("Email is not verified yet. Please check your inbox or spam folder.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred checking verification status.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!auth.currentUser) return;

        setResendLoading(true);
        setError("");
        setMessage("");

        try {
            await sendEmailVerification(auth.currentUser);
            setMessage("Verification email has been resent successfully!");
        } catch (err: any) {
            if (err.code === "auth/too-many-requests") {
                setError("We've sent too many requests. Please check your email or try again later.");
            } else {
                setError(err.message || "Failed to resend verification email.");
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden w-full font-[family-name:var(--font-heading)]">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-zinc-800/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Centered glass card */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0f0f0f]/90 backdrop-blur-md border border-white/5 shadow-2xl shadow-black/50 p-10 flex flex-col">
                {/* Logo */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-white/5 mb-8 mx-auto shadow-inner overflow-hidden">
                    <Image
                        src="/company-logo.png"
                        alt="Project Immortal Logo"
                        width={64}
                        height={64}
                        className="object-cover scale-[1.15]"
                    />
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                        Verify Your Email
                    </h2>
                    <p className="text-sm font-medium text-zinc-400 font-[family-name:var(--font-body)]">
                        We've sent a verification link to your email. Please click the link to verify your account.
                    </p>
                </div>

                {/* Status Messages */}
                <div className="flex flex-col w-full gap-6">
                    {error && <Alert type="error" message={error} />}
                    {message && <Alert type="success" message={message} />}

                    <div className="pt-2 flex flex-col gap-4">
                        <button
                            onClick={checkVerificationStatus}
                            disabled={loading || resendLoading}
                            className="w-full bg-white text-black font-bold px-5 py-3.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Checking..." : "I have verified my email"}
                        </button>

                        <button
                            onClick={handleResendEmail}
                            disabled={loading || resendLoading}
                            className="w-full bg-transparent border border-white/10 text-white font-bold px-5 py-3.5 rounded-xl hover:bg-white/5 transition-colors shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? "Sending..." : "Resend Verification Email"}
                        </button>
                    </div>

                    <div className="w-full text-center mt-4 border-t border-white/5 pt-6">
                        <button
                            onClick={() => {
                                auth.signOut();
                                router.push("/login");
                            }}
                            className="text-xs text-zinc-500 hover:text-white transition-colors font-[family-name:var(--font-body)]"
                        >
                            Sign out and use a different account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
