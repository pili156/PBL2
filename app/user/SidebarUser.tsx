'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  HandCoins,
} from "lucide-react";
import { useSidebar } from "../components/SidebarProvider";

const menuItems = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/pengajuan", label: "Pengajuan Studi", icon: FileText },
  { href: "/user/riwayat", label: "Riwayat & Monitoring", icon: ClipboardList },
  { href: "/user/user-reimbursement", label: "Pengajuan Beasiswa", icon: HandCoins },
];

export default function SidebarUser() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`bg-[#0A192F] text-white flex flex-col flex-shrink-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-[260px]"
      }`}
    >
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
            <p className="text-[8px] text-slate-300 mt-1 leading-tight uppercase tracking-wider">
              Sistem Informasi Gelar Akademik Polines
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center transition-colors ${
                collapsed ? "justify-center px-0 py-4" : "gap-3 px-8 py-3.5"
              } ${
                isActive
                  ? "bg-[#1A56DB] text-white"
                  : "text-slate-300 hover:bg-slate-800"
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
  );
}
