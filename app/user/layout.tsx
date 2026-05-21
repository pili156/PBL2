import { headers } from "next/headers";

// Import komponen Client
import SidebarUser from "./SidebarUser";
import ProfileDropdown from "./ProfileDropdown"; 

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const currentUserEmail = headersList.get('x-user-email') || "Guest";

  return (
    <div className="flex h-screen bg-[#F4F7F6] font-sans">
      {/* Sidebar */}
       <SidebarUser />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[80px] bg-[#0A192F] text-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wide">Dashboard</h2>
          
          {/* Memanggil Komponen Dropdown */}
          <ProfileDropdown email={currentUserEmail} />

        </header>

         {/* Page Content */}
         <main className="flex-1 overflow-auto p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}