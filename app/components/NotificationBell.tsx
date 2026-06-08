"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        title="Notifikasi"
      >
        <Bell size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Notifikasi</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <BellOff size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">Belum ada notifikasi</p>
            <p className="text-xs text-slate-400 mt-1 text-center">Notifikasi akan muncul di sini setelah fitur diaktifkan.</p>
          </div>
        </div>
      )}
    </div>
  );
}
