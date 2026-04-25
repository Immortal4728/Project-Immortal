"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LineChart,
  Home,
  UserCircle,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Admin Profile", href: "/admin/profile", icon: Home },
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Project Submissions",
      href: "/admin/submissions",
      icon: FolderKanban,
    },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Customers", href: "/admin/customers", icon: UserCircle },
    { name: "Analytics", href: "/admin/analytics", icon: LineChart },
  ];

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs tracking-wider">
                PI
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
                Project Immortal
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                Admin Portal
              </p>
            </div>
          </div>
          {/* Close button — mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/submissions" &&
              pathname.startsWith("/admin/submissions/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110 text-white" : "group-hover:scale-110 group-hover:text-white"}`}
              />
              <span className="text-sm font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 mt-auto">
        <SignOutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0a0a0a] flex-col h-full z-20 hidden md:flex font-[family-name:var(--font-body)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Drawer */}
        <aside
          className={`absolute top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col font-[family-name:var(--font-body)] transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
