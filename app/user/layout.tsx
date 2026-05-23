import { cookies } from "next/headers";
import { headers } from "next/headers";

// Import komponen Client
import SidebarUser from "./SidebarUser";
import ProfileDropdown from "../components/ProfileDropdown"; 

// Menggunakan instance Prisma
import { prisma } from "../../src/lib/prisma";

function getPageTitle(pathname: string): string {
  if (pathname.includes('/pengajuan')) return 'Pengajuan Studi/Beasiswa';
  if (pathname.includes('/riwayat') || pathname.includes('/status')) return 'Riwayat & Monitoring';
  if (pathname.includes('/laporanKHS')) return 'Laporan KHS';
  if (pathname.includes('/user-reimbursement')) return 'Reimbursement';
  return 'Dashboard';
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get('x-nextjs-pathname') || '';
  
  const userEmailFromCookie = cookieStore.get("user_email")?.value;

  let userData = {
    email: "Guest",
    name: "User",
    nip: undefined as string | undefined,
    role: "dosen",
    roleDisplay: "Dosen",
    unitKerja: undefined as string | undefined,
    jabatan: undefined as string | undefined,
  };
  
  if (userEmailFromCookie) {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmailFromCookie,
      },
      include: {
        master_dosen: {
          select: {
            nama_lengkap: true,
            nip: true,
            unit_kerja: true,
            jabatan: true,
          }
        }
      }
    });

    if (user) {
      userData = {
        email: user.email || "Guest",
        name: user.master_dosen?.nama_lengkap || user.username || "User",
        nip: user.master_dosen?.nip || undefined,
        role: "dosen",
        roleDisplay: "Dosen",
        unitKerja: user.master_dosen?.unit_kerja || undefined,
        jabatan: user.master_dosen?.jabatan || undefined,
      };
    }
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen bg-[#F4F7F6] font-sans">
      {/* Sidebar */}
       <SidebarUser />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[80px] bg-[#0A192F] text-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wide">{pageTitle}</h2>
          
          <ProfileDropdown user={userData} />

        </header>

         {/* Page Content */}
         <main className="flex-1 overflow-auto p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}