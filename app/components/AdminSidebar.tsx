"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  UserCheck,
};

export type MenuItem = {
  href: string;
  label: string;
  icon: string;
};

export default function AdminSidebar({ menuItems }: { menuItems: MenuItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-4 flex flex-col">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = iconMap[item.icon];
        if (!Icon) return null;
        return (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-8 py-3.5 transition-colors ${
              isActive ? "bg-[#1A56DB] text-white" : "text-slate-300 hover:bg-slate-800"
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
