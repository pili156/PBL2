"use client";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import HelpButton from "./HelpButton";
import ProfileDropdown from "./ProfileDropdown";

type UserData = {
  email: string;
  name: string;
  nip?: string;
  role: string;
  roleDisplay: string;
  unitKerja?: string;
  jabatan?: string;
  no_telp?: string;
};

export default function Header({
  user,
}: {
  user: UserData;
}) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 bg-[#0A192F] flex items-center justify-between px-6 flex-shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        title="Toggle Sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <GlobalSearch />
        <div className="w-px h-6 bg-slate-700/50 mx-1" />
        <NotificationBell />
        <HelpButton />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
