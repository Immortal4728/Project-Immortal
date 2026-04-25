"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const testimonials: Testimonial[] = [
    {
        avatarSrc: "/pavan1.png",
        name: "Pavan Narasimha",
        handle: "HR Manager",
        text: "Project Immortal builds more than academic projects—they build systems that reflect real industry standards. The level of structure, documentation, and execution shows genuine engineering discipline.",
    },
];

export default function StudentLoginPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        const formData = new FormData(event.currentTarget);
        const email = (formData.get("email") as string)?.trim().toLowerCase();
        const password = (formData.get("password") as string)?.trim();

        if (!email || !password) {
            alert("Please fill in both Email and Password fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/student/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data && data.success) {
                // Prefetch dashboard data while the router navigates (fire-and-forget)
                fetch("/api/student/session", { credentials: "include" }).catch(() => {});
                router.push("/student/dashboard");
            } else {
                alert(data?.error || "Invalid credentials. Please check your email and password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background text-foreground">
            <SignInPage
                title={
                    <span className="font-light text-foreground tracking-tighter">
                        Student Portal
                    </span>
                }
                description="Sign in with the credentials sent to your email after project approval."
                heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
                testimonials={testimonials}
                onSignIn={handleSignIn}
                submitLabel={isSubmitting ? "Signing In..." : "Sign In"}
                bottomNote={
                    <span className="text-xs text-muted-foreground">
                        Use the credentials from your approval email.
                    </span>
                }
            />
        </div>
    );
}
