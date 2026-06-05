import { headers } from "next/headers";

import Header from "../components/Header";
import { SidebarProvider } from "../components/SidebarProvider";
import { getUserFromToken } from "../../src/lib/auth-user";
import { ROLES } from "@/src/lib/constants/roles";

function getPageTitle(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/profile')) return 'Profile';
  if (pathname.includes('/change-password')) return 'Ubah Password';
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
    <SidebarProvider>
      <div className="flex h-screen bg-[#F4F7F6] font-sans">
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
