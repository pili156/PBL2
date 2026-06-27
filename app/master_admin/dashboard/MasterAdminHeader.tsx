"use client";

import { useState, Suspense } from "react";
import { Download, AlertCircle } from "lucide-react";
import DateFilter from "./DateFilter";

export default function MasterAdminHeader({
  exportData,
  dari,
  sampai,
}: {
  exportData: any[];
  dari?: string;
  sampai?: string;
}) {
  const [showAlert, setShowAlert] = useState(false);

  const handleExport = async () => {
    if (!exportData || exportData.length === 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      return;
    }

    const XLSXModule = await import("xlsx");
    const wb = XLSXModule.utils.book_new();
    const ws = XLSXModule.utils.json_to_sheet(exportData);

    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length * 1.5, 20),
    }));
    ws["!cols"] = colWidths;

    XLSXModule.utils.book_append_sheet(wb, ws, "Data_User");

    let fileName = "Data_User_Master_Admin_Semua_Waktu.xlsx";
    if (dari && sampai) {
      fileName = `Data_User_Master_Admin_${dari}_sd_${sampai}.xlsx`;
    } else if (dari) {
      fileName = `Data_User_Master_Admin_Sejak_${dari}.xlsx`;
    } else if (sampai) {
      fileName = `Data_User_Master_Admin_Hingga_${sampai}.xlsx`;
    }

    XLSXModule.writeFile(wb, fileName);
  };

  return (
    <>
      {/* ALERT NOTIFICATION (Muncul saat data export kosong) */}
      {showAlert && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle size={20} className="text-rose-500" />
          <span className="text-sm font-bold">
            Tidak ada data untuk di-export pada rentang tanggal ini.
          </span>
          <button
            onClick={() => setShowAlert(false)}
            className="ml-auto text-rose-400 hover:text-rose-600 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* HEADER & ACTIONS (Disamakan dengan Dashboard Admin) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Master Admin</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau aktivitas sistem, kelola pengguna, dan tinjau log aktivitas secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Suspense fallback={null}>
            <DateFilter />
          </Suspense>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Download size={16} strokeWidth={2.5} />
            Export Data
          </button>
        </div>
      </div>
    </>
  );
}