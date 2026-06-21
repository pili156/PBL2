import { headers } from "next/headers";
import { SidebarProvider } from "./SidebarProvider";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar";
import { getUserFromToken } from "@/src/lib/auth-user";
import { ROLES } from "@/src/lib/constants/roles";

import type { MenuItem } from "@/src/types";

function getPageTitle(pathname: string, role: string): string {
  if (pathname.includes('/verifikasi-pengajuan')) return 'Verifikasi Pengajuan';
  if (pathname.includes('/riwayat-dosen')) return 'Monitoring Dosen';
  if (pathname.includes('/buku-induk')) return 'Buku Induk';
  if (pathname.includes('/master-jabatan')) return 'Master Jabatan';
  if (pathname.includes('/master-pangkat')) return 'Master Pangkat';
  if (pathname.includes('/profile')) return 'Profile';
  if (pathname.includes('/change-password')) return 'Ubah Password';
  if (pathname.includes('/bantuan-studi')) return 'Bantuan Studi';
  if (pathname.includes('/status')) return 'Status';
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (role === ROLES.MASTER_ADMIN && pathname.includes('/monitoring-pengguna')) return 'Monitoring Pengguna';
  if (role === ROLES.MASTER_ADMIN && pathname.includes('/role-permission')) return 'Peran & Hak Akses';
  if (role === ROLES.MASTER_ADMIN && pathname.includes('/audit-log')) return 'Log Aktivitas';
  return 'Dashboard';
}

export default async function AdminLayout({
  role,
  menuItems,
  children,
  fallbackRoles,
}: {
  role: string;
  menuItems: MenuItem[];
  children: React.ReactNode;
  fallbackRoles?: string[];
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-nextjs-pathname') || '';

  const userData = await getUserFromToken(role, fallbackRoles);
  const pageTitle = getPageTitle(pathname, role);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#F4F7F6] font-sans">
        <AdminSidebar menuItems={menuItems} currentRole={userData.role} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={userData} />
          <main className="flex-1 overflow-auto p-8 bg-[#F8FAFC]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
