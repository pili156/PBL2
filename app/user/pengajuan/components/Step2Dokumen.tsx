"use client";

import { useMemo } from "react";
import { ChevronRight, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { DOCUMENT_GROUPS } from "../constants";

type Props = {
  onNext: (groupKey: string) => void;
  onPrev: () => void;
};

interface DocGroupInfo {
  key: string;
  label: string;
  description: string;
  documentCount: number;
  requiredCount: number;
  optionalCount: number;
}

export default function Step2Dokumen({ onNext, onPrev }: Props) {
  const documentGroups = useMemo<DocGroupInfo[]>(() => {
    return Object.entries(DOCUMENT_GROUPS).map(([key, value]) => ({
      key,
      label: value.label,
      description: value.description,
      documentCount: value.documents.length,
      requiredCount: value.documents.filter(d => d.required).length,
      optionalCount: value.documents.filter(d => !d.required).length,
    }));
  }, []);

  const totalRequired = documentGroups.reduce((acc, g) => acc + g.requiredCount, 0);
  const totalOptional = documentGroups.reduce((acc, g) => acc + g.optionalCount, 0);
  const totalDocs = documentGroups.reduce((acc, g) => acc + g.documentCount, 0);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dokumen Kepegawaian
        </h1>
        <p className="text-gray-600">
          Siapkan dokumen yang diperlukan untuk pengajuan studi lanjut. 
          Pastikan semua dokumen dalam format PDF dengan ukuran maksimal 2MB per file.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} />
            <span className="text-sm font-medium opacity-90">Total Dokumen</span>
          </div>
          <div className="text-3xl font-bold">{totalDocs}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} />
            <span className="text-sm font-medium opacity-90">Wajib</span>
          </div>
          <div className="text-3xl font-bold">{totalRequired}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} />
            <span className="text-sm font-medium opacity-90">Opsional</span>
          </div>
          <div className="text-3xl font-bold">{totalOptional}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium opacity-90">Status</span>
          </div>
          {/* PERBAIKAN: Mengubah ukuran teks menjadi text-2xl dan menambahkan truncate */}
          <div className="text-2xl font-bold truncate" title="Menunggu">Menunggu</div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {documentGroups.map((group) => (
          <button
            key={group.key}
            onClick={() => onNext(group.key)}
            className="w-full group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg hover:bg-blue-50/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                    {group.label.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                      {group.requiredCount} WAJIB
                    </span>
                    {group.optionalCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                        {group.optionalCount} OPSIONAL
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {group.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{group.documentCount} total dokumen</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>{group.requiredCount} wajib</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>{group.optionalCount} opsional</span>
                </div>
              </div>

              <div className="ml-6 flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <ChevronRight
                    size={24}
                    className="text-blue-600 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Perhatian Penting:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Pastikan semua dokumen WAJIB sudah disiapkan sebelum melanjutkan</li>
              <li>Dokumen opsional bersifat opsional namun sangat disarankan</li>
              <li> Semua dokumen harus dalam format PDF dengan ukuran maksimal 2MB</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
        >
          ← Sebelumnya
        </button>
      </div>
    </div>
  );
}