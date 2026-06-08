"use client";
import { useState, useRef, useEffect } from "react";
import { HelpCircle, BookOpen, MessageCircle, Mail, FileText, ExternalLink } from "lucide-react";

const helpItems = [
  { label: "Panduan Penggunaan", icon: BookOpen, description: "Pelajari cara menggunakan SIGAP", url: "/panduan" },
  { label: "FAQ", icon: MessageCircle, description: "Pertanyaan yang sering diajukan", url: "/faq" },
  { label: "Hubungi Admin", icon: Mail, description: "Kontak operator/admin sistem", url: "mailto:admin@polines.ac.id" },
  { label: "Dokumentasi", icon: FileText, description: "Dokumentasi teknis sistem", url: "/dokumentasi" },
];

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setComingSoon(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (item: typeof helpItems[0]) => {
    if (item.url.startsWith("http") || item.url.startsWith("mailto")) {
      window.open(item.url, "_blank");
    } else {
      setComingSoon(item.label);
      setTimeout(() => setComingSoon(null), 2000);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        title="Bantuan"
      >
        <HelpCircle size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Bantuan</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Panduan & dukungan sistem</p>
          </div>

          <div className="p-2">
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                  {!item.url.startsWith("http") && !item.url.startsWith("mailto") && (
                    <ExternalLink size={14} className="text-slate-300 flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {comingSoon && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 font-medium text-center">
              Halaman {comingSoon} sedang dalam pengembangan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
