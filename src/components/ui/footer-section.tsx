'use client';

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import {
    GithubIcon,
    LinkedinIcon,
    MailIcon,
    PhoneIcon,
    UserIcon,
    InstagramIcon
} from 'lucide-react';

interface FooterLink {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
    label: string;
    links: FooterLink[];
}

const footerLinks: FooterSection[] = [
    {
        label: 'PRODUCT / SOLUTIONS',
        links: [
            { title: 'Fullstack Development', href: '#' },
            { title: 'IOT Development', href: '#' },
            { title: 'App Development', href: '#' },
            { title: 'AI Development', href: '#' },
        ],
    },
    {
        label: 'Company',
        links: [
            { title: 'About Project Immortal', href: '/about' },
            { title: 'Contact', href: '/contact' },
            { title: 'Privacy Policy', href: '/privacy-policy' },
            { title: 'Terms & Conditions', href: '/terms' },
        ],
    },
    {
        label: 'Social Links',
        links: [
            {
                title: 'GitHub',
                href: 'https://github.com/Immortal4728',
                icon: GithubIcon,
            },
            {
                title: 'LinkedIn',
                href: 'https://www.linkedin.com/in/immortal4728',
                icon: LinkedinIcon,
            },
            {
                title: 'Email',
                href: 'mailto:rishichowdary2099@gmail.com',
                icon: MailIcon,
            },
            {
                title: 'Instagram',
                href: 'https://www.instagram.com/immortal.4728/',
                icon: InstagramIcon,
            },
        ],
    },
    {
        label: 'Contact Us',
        links: [
            { title: 'Rishi Chowdary', href: '#', icon: UserIcon },
            {
                title: 'rishichowdary2099@gmail.com',
                href: 'mailto:rishichowdary2099@gmail.com',
                icon: MailIcon,
            },
            {
                title: '+918328465473',
                href: 'tel:+918328465473',
                icon: PhoneIcon,
            },
        ],
    },
];

export function Footer() {
    return (
        <footer className="relative w-full flex flex-col items-center justify-center border-t border-white/10 bg-black px-6 py-12 lg:py-16 text-white">

            <div className="grid w-full max-w-6xl mx-auto gap-8 xl:grid-cols-3 xl:gap-8">

                {/* LOGO + BRAND */}
                <AnimatedContainer className="space-y-4">

                    {/* LOGO */}
                    <div className="relative w-40 h-14">
                        <Image
                            src="/company-logo.png"
                            alt="Project Immortal Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h2 className="text-xl font-bold tracking-tight">
                        PROJECT IMMORTAL
                    </h2>

                    <p className="text-white/60 text-sm">
                        Engineering Software That Endures.
                    </p>

                    <p className="text-white/40 text-xs pt-4">
                        © PROJECT IMMORTAL — Rishi Chowdary. All Rights Reserved.
                    </p>

                </AnimatedContainer>

                {/* LINKS */}
                <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
                    {footerLinks.map((section, index) => (
                        <AnimatedContainer
                            key={section.label}
                            delay={0.1 + index * 0.1}
                        >
                            <div>
                                <h3 className="text-xs text-white/80 tracking-wider">
                                    {section.label}
                                </h3>

                                <ul className="mt-4 space-y-2 text-sm text-white/60">
                                    {section.links.map((link) => (
                                        <li key={link.title}>
                                            <a
                                                href={link.href}
                                                className="hover:text-white inline-flex items-center transition-all duration-300"
                                            >
                                                {link.icon && (
                                                    <link.icon className="me-1 size-4" />
                                                )}
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedContainer>
                    ))}
                </div>

            </div>
        </footer>
    );
}

type ViewAnimationProps = {
    delay?: number;
    className?: ComponentProps<typeof motion.div>['className'];
    children: ReactNode;
};

function AnimatedContainer({
    className,
    delay = 0.1,
    children,
}: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}