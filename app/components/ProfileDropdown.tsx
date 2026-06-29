"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatNamaDenganGelar } from "@/src/lib/formatters";
import {
  User,
  ChevronDown,
  Lock,
  Bell,
  Settings,
  LogOut,
  Edit3,
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
} from "lucide-react";

type UserData = {
  email: string;
  name: string;
  nip?: string;
  gelar?: string;
  role: string;
  roleDisplay: string;
  jabatan?: string;
  no_telp?: string;
};

export default function ProfileDropdown({ user }: { user: UserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleCookieMap: Record<string, string> = {
    dosen: 'token_dosen',
    admin: 'token_admin',
    master_admin: 'token_master_admin',
  };

  const rolePathMap: Record<string, string> = {
    dosen: '/user',
    admin: '/admin',
    master_admin: '/master_admin',
  };

  const handleLogout = () => {
    const cookieName = roleCookieMap[user.role];
    if (cookieName) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    router.push("/login");
    router.refresh();
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none text-white truncate max-w-[140px]">
            {formatNamaDenganGelar(user.name || '', user.gelar || '')}
          </span>
          <span className="text-xs text-slate-400 mt-1">{user.roleDisplay}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="flex">
            {/* Left Column - Profile Detail */}
            <div className="w-[55%] p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Profil Saya</h3>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">
            {formatNamaDenganGelar(user.name || '', user.gelar || '')}
                  </p>
                  {user.nip && (
                    <p className="text-xs text-slate-500 mt-0.5">NIP: {user.nip}</p>
                  )}
                  <span className="inline-block mt-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {user.roleDisplay}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-24 text-xs">Email</span>
                  <span className="text-slate-700 text-xs font-medium truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-24 text-xs">No. HP</span>
                  <span className="text-slate-700 text-xs font-medium">{user.no_telp || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-24 text-xs">Jabatan</span>
                  <span className="text-slate-700 text-xs font-medium truncate">
                    {user.jabatan || "-"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`${rolePathMap[user.role]}/profile`)}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Edit3 size={14} />
                Edit Profil
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-px bg-slate-200 flex-shrink-0" />

            {/* Right Column - Menu Actions */}
            <div className="w-[45%] p-6 flex flex-col gap-1">
              <button
                onClick={() => router.push(`${rolePathMap[user.role]}/change-password`)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors w-full text-left"
              >
                <Lock size={16} className="text-slate-400" />
                <span>Ubah Password</span>
              </button>
              <button
                onClick={() => router.push(`${rolePathMap[user.role]}/profile`)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors w-full text-left"
              >
                <Settings size={16} className="text-slate-400" />
                <span>Pengaturan</span>
              </button>

              <div className="border-t border-slate-100 my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left font-medium"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
