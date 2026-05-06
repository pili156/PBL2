"use client";

import { useState, useRef } from "react";
import { CheckCircle, Download, Home, Printer, Mail, Phone, Calendar, FileText, Copy, Check, Clock, Users, Building } from "lucide-react";

type Props = {
  onViewStatus: () => void;
  onBackHome: () => void;
  pengajuanId?: number;
};

export default function StepCompleted({ onViewStatus, onBackHome, pengajuanId }: Props) {
  const [pengajuanNumber] = useState(pengajuanId?.toString().slice(-6) || Date.now().toString().slice(-6));
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(`PLG-${pengajuanNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <CheckCircle size={56} className="text-green-600" strokeWidth={1.5} />
          </div>
          <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
            ✓ PENGAJUAN BERHASIL DIKIRIM
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pengajuan Studi Lanjut Berhasil!
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Terima kasih telah mengirimkan pengajuan studi lanjut. Pengajuan Anda akan diproses dalam 2-5 hari kerja.
        </p>

        <div ref={printRef} className="w-full max-w-2xl mb-8 print:border print:border-gray-300 print:p-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-white print:bg-white print:text-gray-900 print:border print:border-gray-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">BUKTI PENGAJUAN</h2>
                <p className="text-blue-200 text-sm print:text-gray-600">Nomor Referensi</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center print:bg-gray-100">
                <Building size={32} className="print:text-gray-600" />
              </div>
            </div>

            <div className="text-4xl font-bold mb-6">
              PLG-{pengajuanNumber}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white/10 p-4 rounded-lg print:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-300 print:text-gray-500" />
                  <span className="text-xs text-blue-200 print:text-gray-500">Tanggal Pengajuan</span>
                </div>
                <p className="font-semibold">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-lg print:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-blue-300 print:text-gray-500" />
                  <span className="text-xs text-blue-200 print:text-gray-500">Estimasi Proses</span>
                </div>
                <p className="font-semibold">2-5 Hari Kerja</p>
              </div>

              <div className="bg-white/10 p-4 rounded-lg print:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-300 print:text-gray-500" />
                  <span className="text-xs text-blue-200 print:text-gray-500">Status</span>
                </div>
                <p className="font-semibold">Menunggu Verifikasi</p>
              </div>

              <div className="bg-white/10 p-4 rounded-lg print:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-300 print:text-gray-500" />
                  <span className="text-xs text-blue-200 print:text-gray-500">Total Dokumen</span>
                </div>
                <p className="font-semibold">21 Dokumen</p>
              </div>
            </div>

            <div className="text-center text-xs text-blue-200 print:text-gray-500 pt-4 border-t border-white/20 print:border-gray-300">
              Simpan nomor referensi ini untuk memantau status pengajuan
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">
            Langkah Selanjutnya:
          </h3>
          <ol className="space-y-3 text-left">
            {[
              { title: "Verifikasi Dokumen", desc: "Tim admin akan memverifikasi kelengkapan dokumen Anda" },
              { title: "Notifikasi Status", desc: "Anda akan menerima pemberitahuan melalui email jika ada dokumen yang kurang" },
              { title: "Monitoring", desc: "Pantau status pengajuan melalui dashboard pengguna" },
              { title: "Keputusan", desc: "Keputusan akhir akan dikirimkan melalui email terdaftar" },
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all shadow-md"
          >
            <Printer size={20} />
            Cetak Bukti
          </button>

          <button
            onClick={onViewStatus}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            <FileText size={20} />
            Lihat Status
          </button>

          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            <Home size={20} />
            Dashboard
          </button>
        </div>

        <div className="mt-10 p-6 bg-gray-50 rounded-xl max-w-2xl w-full print:hidden">
          <h4 className="font-semibold text-gray-900 mb-4">Butuh Bantuan?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <a href="mailto:support@sigap.ac.id" className="text-blue-600 hover:underline font-medium">
                  support@sigap.ac.id
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Telepon</p>
                <p className="font-medium text-gray-900">+62 xxx-xxxx-xxxx</p>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            .print\\:hidden { display: none !important; }
            .print\\:border { border: 1px solid #e5e7eb !important; }
            .print\\:p-6 { padding: 1.5rem !important; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:text-gray-900 { color: #111827 !important; }
            .print\\:text-gray-600 { color: #4b5563 !important; }
            .print\\:text-gray-500 { color: #6b7280 !important; }
            .print\\:text-gray-300 { color: #d1d5db !important; }
            .print\\:text-green-600 { color: #16a34a !important; }
            .print\\:text-green-700 { color: #15803d !important; }
            .print\\:bg-gray-50 { background-color: #f9fafb !important; }
            .print\\:bg-gray-100 { background-color: #f3f4f6 !important; }
            .print\\:bg-gray-200 { background-color: #e5e7eb !important; }
            body { background: white !important; }
            .bg-gradient-to-br { background: white !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
