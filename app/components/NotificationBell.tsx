"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

const notifications = [
  {
    id: 1,
    title: "KHS Baru",
    description: "Dosen A. Rahman mengupload KHS baru",
    time: "5 menit lalu",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
    unread: true,
  },
  {
    id: 2,
    title: "Pengajuan Bantuan Studi",
    description: "Pengajuan bantuan studi dari Dr. Sari menunggu verifikasi",
    time: "1 jam lalu",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    unread: true,
  },
  {
    id: 3,
    title: "Reimbursement",
    description: "Reimbursemen S2 atas nama Budi Santoso menunggu verifikasi",
    time: "3 jam lalu",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-50",
    unread: false,
  },
  {
    id: 4,
    title: "Dokumen Revisi",
    description: "Dokumen KHS direvisi oleh dosen, cek kembali",
    time: "1 hari lalu",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
    unread: false,
  },
];

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

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Notifikasi</h3>
            <span className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
              Tandai dibaca
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    notif.unread ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${notif.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={14} className={notif.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                  </div>
                  {notif.unread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href="#"
            className="block text-center py-2.5 text-xs font-medium text-blue-600 hover:bg-slate-50 border-t border-slate-100 transition-colors"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  );
}
