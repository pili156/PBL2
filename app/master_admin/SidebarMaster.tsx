"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  UserCheck
} from "lucide-react";

const menuItems = [
  { href: "/master_admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/master_admin/verifikasi-pengajuan", label: "Verifikasi Pengajuan", icon: ShieldCheck },
  { href: "/master_admin/riwayat-dosen", label: "Monitoring Dosen", icon: Users },
  { href: "/master_admin/buku-induk", label: "Buku Induk", icon: BookOpen },
  { href: "/master_admin/monitoring-pengguna", label: "Monitoring Pengguna", icon: UserCheck },
];

export default function SidebarMaster() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-4 flex flex-col">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-8 py-3.5 transition-colors ${
              isActive
                ? "bg-[#1A56DB] text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Icon size={20} strokeWidth={2} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
