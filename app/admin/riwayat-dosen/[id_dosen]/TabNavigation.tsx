// app/admin/riwayat-dosen/[id_dosen]/TabNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabNavigation({ idDosen }: { idDosen: string }) {
  const pathname = usePathname();

  const baseUrl = `/admin/riwayat-dosen/${idDosen}`;

  const tabs = [
    {
      name: 'Riwayat Studi',
      href: baseUrl,
    },
    {
      name: 'Riwayat KHS',
      href: `${baseUrl}/khs`,
    },
    {
      name: 'Riwayat Keuangan',
      href: `${baseUrl}/keuangan`,
    },
  ];

  return (
    <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 px-2 pt-2">
      <div className="flex">
        {tabs.map((tab) => {
          // FIX: Tab "Riwayat Studi" hanya aktif jika URL persis sama (tidak termasuk sub-rute)
          // Tab lainnya akan aktif jika URL cocok atau ada sub-rutenya (misal: /khs/1)
          const isActive = tab.href === baseUrl
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all duration-200 ${
                isActive
                  ? 'text-sigap-primary border-sigap-primary'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}