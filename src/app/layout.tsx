import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import LoadingScreen from "@/components/LoadingScreen";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Immortal | Engineering Ideas Into Real Software",
  description: "Have a final-year project idea or need production-grade help? Concept → Architecture → Working System. We build real software systems with modern tech stacks.",
  keywords: ["Software Development", "Final Year Projects", "Web Development", "App Development", "Project Immortal", "Engineering Projects", "React", "Next.js"],
  openGraph: {
    title: "Project Immortal",
    description: "Engineering Ideas Into Real Software.",
    url: "https://project-immortal.vercel.app",
    siteName: "Project Immortal",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Immortal",
    description: "Engineering Ideas Into Real Software.",
  },
  verification: {
    google: "oWySz4N_EjiGkuDDDqcxlS0fEDQfrmK1Mpv2lViyUGA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingScreen>
          <ClientLayout>
            {children}
          </ClientLayout>
        </LoadingScreen>
      </body>
    </html>
  );
}