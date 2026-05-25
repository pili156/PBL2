import Image from "next/image";
import { headers } from "next/headers";
import ProfileDropdown from "./ProfileDropdown";
import AdminSidebar from "./AdminSidebar";
import { getUserFromToken } from "@/src/lib/auth-user";
import { ROLES } from "@/src/lib/constants/roles";
import type { MenuItem } from "../configs/menu";

function getPageTitle(pathname: string, role: string): string {
  if (pathname.includes('/verifikasi-pengajuan')) return 'Verifikasi Pengajuan';
  if (pathname.includes('/riwayat-dosen')) return 'Monitoring Dosen';
  if (pathname.includes('/buku-induk')) return 'Buku Induk';
  if (role === ROLES.MASTER_ADMIN && pathname.includes('/monitoring-pengguna')) return 'Monitoring Pengguna';
  return 'Dashboard';
}

export default async function AdminLayout({
  role,
  menuItems,
  children,
}: {
  role: string;
  menuItems: MenuItem[];
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-nextjs-pathname') || '';

  const userData = await getUserFromToken(role);
  const pageTitle = getPageTitle(pathname, role);

  return (
    <div className="flex h-screen bg-[#F4F7F6] font-sans">
      <aside className="w-[260px] bg-[#0A192F] text-white flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/dashboard/logo2.png"
              alt="Logo SIGAP"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-wide leading-none">SIGAP</h1>
            <p className="text-[8px] text-slate-300 mt-1 leading-tight uppercase tracking-wider">
              Sistem Informasi Gelar Akademik Polines
            </p>
          </div>
        </div>
        <AdminSidebar menuItems={menuItems} currentRole={role} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[80px] bg-[#0A192F] text-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wide">{pageTitle}</h2>
          <ProfileDropdown user={userData} />
        </header>
        <main className="flex-1 overflow-auto p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
