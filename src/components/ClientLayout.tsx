"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/ui/footer-section";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const hideLayout =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/student") ||
        pathname.startsWith("/employee") ||
        pathname.startsWith("/dashboard");

    return (
        <>
            {!hideLayout && <Navbar />}
            {children}
            {!hideLayout && <Footer />}
        </>
    );
}
