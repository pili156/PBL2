import Image from "next/image";
import { headers } from "next/headers";

import ProfileDropdown from "../components/ProfileDropdown"; 
import { getUserFromToken } from "../../src/lib/auth-user";
import { ROLES } from "@/src/lib/constants/roles";

function getPageTitle(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'Dashboard';
  return 'Dashboard';
}

export default async function KeuanganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-nextjs-pathname') || '';
  
  const userData = await getUserFromToken(ROLES.KEUANGAN);

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen bg-[#F4F7F6] font-sans">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[80px] bg-[#0A192F] text-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wide">{pageTitle}</h2>
          
          <ProfileDropdown user={userData} />

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
