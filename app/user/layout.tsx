import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  ListOrdered, 
  CreditCard, 
  UserCircle
} from "lucide-react";

// Import komponen Client ProfileDropdown
import ProfileDropdown from "./ProfileDropdown"; 

// Menggunakan instance Prisma
import { prisma } from "../../src/lib/prisma";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userEmailFromCookie = cookieStore.get("user_email")?.value;

  let currentUserEmail: string = "Guest";
  
  if (userEmailFromCookie) {
    // Query paling aman, tidak akan kena error relasi
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

  return (
    <div className="flex h-screen bg-[#F4F7F6] font-sans">
      {/* Sidebar */}
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

        <nav className="flex-1 py-4 flex flex-col">
          {/* Link disesuaikan ke dashboard user */}
          <Link href="/user/dashboard" className="flex items-center gap-3 px-8 py-3.5 bg-[#1A56DB] text-white">
            <LayoutDashboard size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-300 hover:bg-slate-800 transition-colors">
            <FileText size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Pengajuan</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-300 hover:bg-slate-800 transition-colors">
            <CheckSquare size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Status</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-300 hover:bg-slate-800 transition-colors">
            <ListOrdered size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Laporan KHS</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-300 hover:bg-slate-800 transition-colors">
            <CreditCard size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Reimbursement</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-300 hover:bg-slate-800 transition-colors">
            <UserCircle size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Profil Saya</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[80px] bg-[#0A192F] text-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wide">Dashboard</h2>
          
          {/* Memanggil Komponen Dropdown */}
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