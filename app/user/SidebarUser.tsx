'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  ListOrdered,
  CreditCard,
  UserCircle
} from "lucide-react";

const menuItems = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/pengajuan", label: "Pengajuan", icon: FileText },
  { href: "/user/status", label: "Status", icon: CheckSquare },
  { href: "/user/laporanKHS", label: "Laporan KHS", icon: ListOrdered },
  { href: "/user/user-reimbursement", label: "Reimbursement", icon: CreditCard },
  { href: "/user/profil", label: "Profil Saya", icon: UserCircle },
];

export default function SidebarUser() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-[#0A192F] text-white flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="w-10 h-10 relative flex-shrink-0">
          <img
            src="/dashboard/logo2.png"
            alt="Logo SIGAP"
            className="object-contain w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-wide leading-none">SIGAP</h1>
          <p className="text-[8px] text-slate-300 mt-1 leading-tight uppercase tracking-wider">
            Sistem Informasi Gelar Akademik Polines
          </p>
        </div>
      </div>

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
    </aside>
  );
}
