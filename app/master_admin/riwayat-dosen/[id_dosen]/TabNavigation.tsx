'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Wallet, FileText, History } from 'lucide-react';

interface Tab {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export default function TabNavigation({ idDosen }: { idDosen: string }) {
  const pathname = usePathname();
  const baseUrl = `/master_admin/riwayat-dosen/${idDosen}`;

  const tabs: Tab[] = [
    { name: 'Dashboard Dosen', href: baseUrl, icon: LayoutDashboard },
    { name: 'Riwayat Studi', href: `${baseUrl}/khs`, icon: BookOpen },
    { name: 'Riwayat Keuangan', href: `${baseUrl}/keuangan`, icon: Wallet },
    { name: 'Dokumen & Surat', href: `${baseUrl}/dokumen`, icon: FileText },
    { name: 'Log Aktivitas', href: `${baseUrl}/log`, icon: History },
  ];

  const isActive = (tab: Tab) => {
    if (tab.href === baseUrl) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(tab.href + '/');
  };

  return (
    <div className="border-b border-slate-200">
      <nav className="flex overflow-x-auto gap-1 -mb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                active
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
