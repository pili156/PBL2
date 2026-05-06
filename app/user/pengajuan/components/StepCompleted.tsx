"use client";

import { CheckCircle, Download, Home } from "lucide-react";

type Props = {
  onViewStatus: () => void;
  onBackHome: () => void;
};

export default function StepCompleted({ onViewStatus, onBackHome }: Props) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4 animate-pulse">
            <CheckCircle size={56} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            ✓ PENGAJUAN TELAH BERHASIL DIKIRIM!
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Pengajuan Anda Berhasil!
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Terima kasih telah mengirimkan pengajuan studi lanjut Anda. Kami akan
          memproses pengajuan Anda dalam waktu 2-5 hari kerja.
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-2xl">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              Pengajuan #{Date.now().toString().slice(-6)}
            </div>
            <p className="text-sm text-gray-600">Nomor Referensi</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 mb-2">Proses</div>
            <p className="text-sm text-gray-600">Status Saat Ini</p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">2-5 Hari</div>
            <p className="text-sm text-gray-600">Estimasi Waktu</p>
          </div>
        </div>

        {/* What's Next */}
        <div className="w-full max-w-2xl mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Langkah Selanjutnya:
          </h3>
          <ol className="space-y-3 text-left">
            {[
              "Kami akan melakukan verifikasi dokumen Anda",
              "Anda akan menerima notifikasi jika ada dokumen yang kurang",
              "Status pengajuan dapat Anda pantau melalui dashboard",
              "Keputusan akhir akan dikirimkan melalui email Anda",
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onViewStatus}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            Lihat Status Pengajuan
          </button>

          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            <Home size={20} />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Support */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg max-w-2xl w-full">
          <p className="text-sm text-gray-600 mb-3">
            Memiliki pertanyaan? Hubungi kami melalui:
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-semibold text-gray-900">Email:</span>{" "}
              <a href="mailto:support@sigap.ac.id" className="text-blue-600 hover:underline">
                support@sigap.ac.id
              </a>
            </p>
            <p>
              <span className="font-semibold text-gray-900">Telepon:</span> +62
              xxx-xxxx-xxxx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
