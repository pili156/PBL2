import Image from "next/image";
import { cookies } from "next/headers";
import { headers } from "next/headers";


import ProfileDropdown from "./ProfileDropdown"; 
import SidebarNav from "./SidebarNav"; 

import { prisma } from "../../src/lib/prisma";

function getPageTitle(pathname: string): string {
  if (pathname.includes('/verifikasi-pengajuan')) return 'Verifikasi Pengajuan';
  if (pathname.includes('/status')) return 'Status Pengajuan';
  if (pathname.includes('/riwayat-dosen')) return 'Riwayat Dosen';
  if (pathname.includes('/reimbursement')) return 'Reimbursement';
  return 'Dashboard';
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get('x-nextjs-pathname') || '';
  
  const userEmailFromCookie = cookieStore.get("user_email")?.value;

  let currentUserEmail: string = "Guest";
  
  if (userEmailFromCookie) {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmailFromCookie,
      },
      select: {
        email: true,
      }
    });

    if (user && user.email) {
      currentUserEmail = user.email;
    }
  }

  const pageTitle = getPageTitle(pathname);

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

        <SidebarNav />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[80px] bg-[#0A192F] text-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wide">{pageTitle}</h2>
          
          {/* Menggunakan komponen Client untuk Dropdown */}
          <ProfileDropdown email={currentUserEmail} />

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}