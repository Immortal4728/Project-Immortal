"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const testimonials: Testimonial[] = [
    {
        avatarSrc: "/pavan1.png",
        name: "Admin Team",
        handle: "Internal",
        text: "The employee portal helps us streamline project records, documentation, and viva questions securely without affecting student source code.",
    },
];

export default function EmployeeLoginPage() {
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
            const res = await fetch("/api/employee/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data && data.success) {
                router.push("/employee/dashboard");
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
                        Employee Portal
                    </span>
                }
                description="Sign in with your employee credentials to manage project documentation."
                heroImageSrc="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=2160&q=80"
                testimonials={testimonials}
                onSignIn={handleSignIn}
                submitLabel={isSubmitting ? "Signing In..." : "Sign In"}
                bottomNote={
                    <span className="text-xs text-muted-foreground">
                        Authorized personnel only.
                    </span>
                }
            />
        </div>
    );
}
