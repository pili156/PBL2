import { headers } from "next/headers";

import SidebarUser from "./SidebarUser";
import Header from "../components/Header";
import { SidebarProvider } from "../components/SidebarProvider";
import { getUserFromToken } from "../../src/lib/auth-user";
import { ROLES } from "@/src/lib/constants/roles";

function getPageTitle(pathname: string): string {
  if (pathname.includes('/pengajuan')) return 'Pengajuan Studi';
  if (pathname.includes('/riwayat') || pathname.includes('/status')) return 'Riwayat & Monitoring';
  if (pathname.includes('/laporanKHS')) return 'Laporan KHS';
  if (pathname.includes('/user-reimbursement')) return 'Pengajuan Beasiswa';
  if (pathname.includes('/profile')) return 'Profile';
  if (pathname.includes('/change-password')) return 'Ubah Password';
  if (pathname.includes('/dashboard')) return 'Dashboard';
  return 'Dashboard';
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-nextjs-pathname') || '';
  
  const userData = await getUserFromToken(ROLES.DOSEN);

  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#F4F7F6] font-sans">
        <SidebarUser />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={userData} />
          <main className="flex-1 overflow-auto p-8 bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
