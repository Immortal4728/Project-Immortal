"use client";

import React from "react";
import { Web3HeroAnimated } from "@/components/ui/animated-web3-landing-page";
import GrowthStory from "@/components/sections/WhatWeEngineer";
import TextMarquee from "@/components/sections/TextMarquee";
import Services from "@/components/sections/Services";
import { motion } from "framer-motion";
import { WebGLShader } from "@/components/ui/web-gl-shader";

import Testimonials from "@/components/sections/Testimonials";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-transparent text-white overflow-x-hidden min-h-screen relative">
      <WebGLShader />
      {/* 1. HERO (Landing page - kept exactly the same) */}
      <div id="home">
        <Web3HeroAnimated />
      </div>

      {/* INFINITY TEXT MARQUEE */}
      <TextMarquee />

      {/* 2. OUR GROWTH STORY */}
      <div id="growthstory">
        <GrowthStory />
      </div>

      {/* 3. CORE DOMAINS */}
      <div id="services">
        <Services />
      </div>

      {/* 5. TESTIMONIALS */}
      {/* Hidden on mobile */}
      <div className="hidden md:block">
        <Testimonials />
      </div>

      {/* 8. CONTACT SECTION */}
      <section id="contact" className="relative w-full py-32 px-6 md:px-12 lg:px-16 bg-black font-[family-name:var(--font-heading)] border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <span className="inline-block px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300 border border-zinc-800 bg-zinc-900/40 rounded-full mb-8">
              Get In Touch
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-[1.05] bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Got a Project Idea? We'll Build It.
            </h2>
            <p className="mt-8 text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-[family-name:var(--font-body)]">
              Have a final-year project idea or need production-grade help? Reach out — we&apos;re here to make it happen.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Left: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-8 text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex items-start gap-5"
              >
                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                  <a href="mailto:conan47289@gmail.com" className="text-lg text-zinc-400 font-[family-name:var(--font-body)] hover:text-white transition-colors">
                    conan47289@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="flex items-start gap-5"
              >
                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">WhatsApp / Phone</h3>
                  <p className="text-lg text-zinc-400 font-[family-name:var(--font-body)]">+91 8328465473</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="flex items-start gap-5"
              >
                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Location</h3>
                  <p className="text-lg text-zinc-400 font-[family-name:var(--font-body)]">Guntur, Andhra Pradesh, India</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex items-start gap-5"
              >
                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Working Hours</h3>
                  <p className="text-lg text-zinc-400 font-[family-name:var(--font-body)]">Monday – Saturday | 9:00 AM – 8:00 PM</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Project Intake CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full relative"
            >
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-8 md:p-10 shadow-2xl text-left flex flex-col justify-center h-full">
                <h3 className="text-3xl font-bold text-white mb-4">Start Your Project</h3>
                <p className="text-lg text-zinc-400 font-[family-name:var(--font-body)] mb-10 leading-relaxed">
                  Have an idea for a final-year project or a real-world software system?<br />
                  Submit your project request and our engineering team will review it and contact you with the next steps.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Link
                    href="/start-project"
                    className="w-full inline-block text-center py-5 bg-white text-black font-bold text-lg rounded-[2rem] hover:bg-zinc-200 shadow-xl shadow-white/5 transition-all cursor-pointer"
                  >
                    Start Your Project Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA (Hero Section) */}
      {/* Hidden on mobile */}
      <section className="hidden md:block py-32 text-center bg-black font-[family-name:var(--font-heading)] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-[1.05] bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-8"
          >
            Turn your project idea into a production-ready system.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl md:text-2xl text-zinc-400 mt-4 mb-12 max-w-2xl mx-auto font-[family-name:var(--font-body)]"
          >
            Concept → Architecture → Working System.
          </motion.p>
          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block rounded-[2rem] bg-white text-black px-12 py-6 font-bold text-xl tracking-tight shadow-2xl shadow-white/10 hover:bg-zinc-200 transition-all duration-300"
          >
            Schedule a Call
          </motion.a>
        </div>
      </section>

    </div>
  );
}