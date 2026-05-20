"use client";

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
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verifikasi-pengajuan", label: "Pengajuan", icon: FileText },
  { href: "/admin/status", label: "Status", icon: CheckSquare },
  { href: "/admin/riwayat-dosen", label: "Riwayat Dosen", icon: ListOrdered },
  { href: "/admin/reimbursement", label: "Reimbursement", icon: CreditCard },
  { href: "/admin/profil", label: "Profil Saya", icon: UserCircle },
];

export default function SidebarNav() {
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
