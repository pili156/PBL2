"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  UserCheck,
  UserCog,
  Shield,
  ClipboardList,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { MenuItem } from "@/src/types";
import { canAccess } from "@/src/lib/auth/permissions";
import { useSidebar } from "./SidebarProvider";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  UserCheck,
  UserCog,
  Shield,
  ClipboardList,
  FileText,
};

const defaultUserItems: MenuItem[] = [
  { href: "/user/dashboard", label: "Dashboard", icon: "LayoutDashboard", allowedRoles: ["dosen"] },
  { href: "/user/pengajuan", label: "Pengajuan Studi", icon: "FileText", allowedRoles: ["dosen"] },
  { href: "/user/riwayat", label: "Riwayat & Monitoring", icon: "ClipboardList", allowedRoles: ["dosen"] },
];

export default function Sidebar({
  menuItems,
  currentRole,
}: {
  menuItems?: MenuItem[];
  currentRole?: string;
}) {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  const items = menuItems || defaultUserItems;
  const filteredItems = currentRole
    ? items.filter((item) => canAccess(currentRole, item.allowedRoles))
    : items;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-slate-700/50 transition-all px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/dashboard/logo2.png"
              alt="Logo SIGAP"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-col hidden lg:flex">
            <h1 className="text-2xl font-bold tracking-wide leading-none">SIGAP</h1>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight uppercase tracking-wider">
              Sistem Informasi Gelar Akademik Polines
            </p>
          </div>
        </div>
        <button onClick={toggleSidebar} className="p-1 text-slate-400 hover:text-white lg:hidden">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 flex flex-col">
        {filteredItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = iconMap[item.icon];
          if (!Icon) return null;
          return (
            <Link key={item.href} href={item.href} onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={`flex items-center gap-3 px-8 py-3.5 transition-colors ${
                isActive ? "bg-[#1A56DB] text-white" : "text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      {/* Desktop sidebar */}
      <aside className={`bg-[#0A192F] text-white hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-[260px]"
      }`}>
        <div className={`flex items-center border-b border-slate-700/50 transition-all ${
          collapsed ? "justify-center p-4" : "gap-3 px-6 py-5"
        }`}>
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/dashboard/logo2.png"
              alt="Logo SIGAP"
              fill
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-wide leading-none">SIGAP</h1>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight uppercase tracking-wider">
                Sistem Informasi Gelar Akademik
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 flex flex-col">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = iconMap[item.icon];
            if (!Icon) return null;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center transition-colors ${
                  collapsed ? "justify-center px-0 py-4" : "gap-3 px-8 py-3.5"
                } ${
                  isActive ? "bg-[#1A56DB] text-white" : "text-slate-100 hover:bg-slate-800"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} strokeWidth={2} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#0A192F] text-white flex flex-col w-[260px] transform transition-transform duration-300 lg:hidden ${
        collapsed ? "-translate-x-full" : "translate-x-0"
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}