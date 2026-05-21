"use client";

import { useState } from "react";
import { User, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileDropdown({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    const cookies = ["token_dosen", "token_admin_fakultas", "token_master_admin", "token_keuangan", "user_email"];
    cookies.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative">
      {/* Tombol Profile */}
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-700">
          <User size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none text-white">{email}</span>
          <span className="text-xs text-slate-400 mt-1">Admin</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </div>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-b-xl shadow-lg py-2 border border-slate-100 border-t-0 z-50 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}