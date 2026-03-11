"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Alert from "@/components/ui/alert";

export const SignIn1 = () => {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const ALLOWED_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);

            if (!userCredential.user.email || !ALLOWED_EMAILS.includes(userCredential.user.email)) {
                await auth.signOut();
                setError("Unauthorized access. Internal staff only.");
                setLoading(false);
                router.push("/login");
                return;
            }

            const token = await userCredential.user.getIdToken();
            localStorage.setItem("token", token);
            document.cookie = `token=${token}; path=/; max-age=86400`;

            // Check Firebase email verification status
            if (!userCredential.user.emailVerified) {
                // Send verification email
                try {
                    await sendEmailVerification(userCredential.user);
                } catch (verifyErr) {
                    // Email may already have been sent recently, continue anyway
                    console.log("Verification email send attempt:", verifyErr);
                }
                router.push("/verify-email");
                return;
            }

            // Email is verified — go straight to dashboard
            router.push("/admin/dashboard");

        } catch (err: unknown) {
            const firebaseErr = err as { code?: string; message?: string };
            console.error("Firebase Auth Error:", firebaseErr.code);
            switch (firebaseErr.code) {
                case "auth/user-not-found":
                    setError("No authorized account found with this email.");
                    break;
                case "auth/wrong-password":
                    setError("Incorrect password. Please try again.");
                    break;
                case "auth/invalid-email":
                    setError("The email address is improperly formatted.");
                    break;
                case "auth/invalid-credential":
                    setError("Invalid credentials. Access denied.");
                    break;
                case "auth/too-many-requests":
                    setError("Too many failed attempts. Try again later.");
                    break;
                default:
                    setError(firebaseErr.message || "An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
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
                        Internal Access Portal
                    </h2>
                    <p className="text-sm font-medium text-zinc-400 font-[family-name:var(--font-body)]">
                        Authorized personnel only.
                    </p>
                </div>

                {/* Form */}
                <div className="flex flex-col w-full gap-6">
                    <div className="w-full flex flex-col gap-4 font-[family-name:var(--font-body)]">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">Email Address</label>
                            <input
                                placeholder="name@projectimmortal.in"
                                type="email"
                                value={email}
                                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-inner"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">Password</label>
                            <input
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-inner"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="w-full">
                                <Alert type="error" message={error} />
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleSignIn}
                            disabled={loading}
                            className="w-full bg-white text-black font-bold px-5 py-3.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Authenticating..." : "Access Portal"}
                        </button>
                    </div>

                    <div className="w-full text-center mt-4 border-t border-white/5 pt-6">
                        <span className="text-xs text-zinc-500 font-[family-name:var(--font-body)]">
                            If you need access, contact the system administrator.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
