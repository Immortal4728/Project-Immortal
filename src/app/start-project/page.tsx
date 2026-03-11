"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Alert from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function StartProjectPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [projectTitle, setProjectTitle] = useState("");
    const [domain, setDomain] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!name.trim() || name.trim().length < 2) {
            newErrors.name = "Full name must be at least 2 characters";
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
            newErrors.phone = "Phone number must contain at least 10 digits";
        }
        if (!projectTitle.trim()) {
            newErrors.projectTitle = "Project title is required";
        }
        if (!domain) {
            newErrors.domain = "Please select a project domain";
        }
        if (!description.trim() || description.trim().length < 20) {
            newErrors.description = "Project description must be at least 20 characters";
        }

        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // Extra safety: prevent completely empty meaningful submission
        if (
            !name.trim() &&
            !email.trim() &&
            !phone.trim() &&
            !projectTitle.trim() &&
            !domain &&
            !description.trim()
        ) {
            setError("Please provide some information before submitting.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/project-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    project_title: projectTitle,
                    domain,
                    description,
                }),
            });

            const data = await res.json();

            if (res.ok || data.success) {
                setSuccess(true);
                // Reset form
                setName("");
                setEmail("");
                setPhone("");
                setProjectTitle("");
                setDomain("");
                setDescription("");
                setValidationErrors({});
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen flex flex-col font-[family-name:var(--font-heading)] selection:bg-white/10">
            <main className="flex-grow flex flex-col items-center pt-28 md:pt-36 pb-24 px-6 md:px-12 lg:px-16 w-full max-w-6xl mx-auto space-y-16 md:space-y-20">

                {/* Hero */}
                <section className="text-center space-y-6 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white"
                    >
                        Start Your Project
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        Submit your project request and our engineering team will review your idea before reaching out with next steps.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-sm font-medium uppercase tracking-wider text-zinc-600"
                    >
                        Final-year projects • Startup MVPs • Production software systems
                    </motion.p>
                </section>

                {/* Form Card */}
                <section className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                        className="bg-neutral-900/70 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 lg:p-10 shadow-xl"
                    >
                        {success && (
                            <div className="mb-10 p-6 bg-green-950/30 border border-green-900/40 rounded-xl text-center">
                                <div className="text-4xl mb-4 text-green-400">✓</div>
                                <h3 className="text-2xl font-semibold text-green-300 mb-3">
                                    Request Received Successfully
                                </h3>
                                <p className="text-zinc-300">
                                    Your project request has been received. Our engineering team will contact you soon.
                                </p>
                            </div>
                        )}

                        {error && <Alert type="error" message={error} className="mb-8" />}

                        <form onSubmit={handleSubmit} className="space-y-14">
                            {/* Contact Information */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-3">
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-zinc-400">
                                            Full Name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-500/30 transition-all duration-200"
                                            placeholder="John Doe"
                                        />
                                        {validationErrors.name && (
                                            <p className="text-xs text-red-500 mt-1.5">{validationErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                                            Email Address *
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-500/30 transition-all duration-200"
                                            placeholder="you@example.com"
                                        />
                                        {validationErrors.email && (
                                            <p className="text-xs text-red-500 mt-1.5">{validationErrors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-zinc-400">
                                            Phone / WhatsApp *
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-500/30 transition-all duration-200"
                                            placeholder="+91 98765 43210"
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-xs text-red-500 mt-1.5">{validationErrors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Project Overview */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-3">
                                    Project Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="projectTitle" className="block text-sm font-medium text-zinc-400">
                                            Project Title *
                                        </label>
                                        <input
                                            id="projectTitle"
                                            type="text"
                                            value={projectTitle}
                                            onChange={(e) => setProjectTitle(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-500/30 transition-all duration-200"
                                            placeholder="AI-Powered Task Manager"
                                        />
                                        {validationErrors.projectTitle && (
                                            <p className="text-xs text-red-500 mt-1.5">{validationErrors.projectTitle}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="domain" className="block text-sm font-medium text-zinc-400">
                                            Project Domain *
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="domain"
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-3.5 text-white appearance-none cursor-pointer focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-500/30 transition-all duration-200 hover:border-neutral-700"
                                            >
                                                <option value="" disabled>
                                                    Select a domain
                                                </option>
                                                <option value="AI / Machine Learning">AI / Machine Learning</option>
                                                <option value="Fullstack Web Application">Fullstack Web Application</option>
                                                <option value="Mobile Application">Mobile Application</option>
                                                <option value="Blockchain">Blockchain</option>
                                                <option value="IoT System">IoT System</option>
                                                <option value="Cloud Platform">Cloud Platform</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        {validationErrors.domain && (
                                            <p className="text-xs text-red-500 mt-1.5">{validationErrors.domain}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Project Description */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-3">
                                    Project Description
                                </h3>
                                <div className="space-y-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-zinc-400">
                                        Describe Your Project *
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        placeholder="Please describe your project idea, goals, key features, target users, timeline expectations, preferred technologies, budget range (if any), and any other relevant details."
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-4 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-500/30 transition-all duration-200 resize-y min-h-[160px]"
                                    />
                                    {validationErrors.description && (
                                        <p className="text-xs text-red-500 mt-1.5">{validationErrors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-8 flex justify-center">
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full md:w-auto px-12 py-4 bg-white text-black font-semibold text-lg rounded-xl shadow-lg hover:bg-neutral-100 active:bg-neutral-200 transition-all duration-200 disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Project Request"
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}