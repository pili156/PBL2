"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Profil Saya", href: "/dashboard/profil", icon: "👤" },
    { name: "Pengajuan", href: "/dashboard/pengajuan", icon: "📝" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-['Inter']">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#007DFE] via-[#013564] to-[#02182D] text-white flex flex-col shadow-xl">
        <div className="p-8 flex flex-col items-center border-b border-white/10">
          <Image 
            src="/logo1.png" 
            alt="Logo Polines" 
            width={80} 
            height={80} 
            className="mb-4"
          />
          <h1 className="text-2xl font-bold tracking-wider">SIGAP</h1>
          <p className="text-[10px] text-gray-300 text-center mt-1 uppercase tracking-widest">
            Gelar Akademik Polines
          </p>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? "bg-[#F6EB16] text-[#013564] font-bold shadow-md" 
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => window.location.href = "/login"}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <span></span> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Atas */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="font-semibold text-gray-700 text-lg">
            {menuItems.find(item => item.href === pathname)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800">Dosen User</p>
              <p className="text-[10px] text-gray-500">NIP: 198XXXXXXXXXXX</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#013564] font-bold border border-blue-200">
              D
            </div>
          </div>
        </header>

        {/* Isi Dashboard */}
        <section className="flex-1 p-8 overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}