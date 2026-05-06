"use client";

import { ChevronRight } from "lucide-react";
import { DOCUMENT_GROUPS } from "../constants";

type Props = {
  onNext: (groupKey: string) => void;
  onPrev: () => void;
};

export default function Step2Dokumen({ onNext, onPrev }: Props) {
  const documentGroups = Object.entries(DOCUMENT_GROUPS).map(
    ([key, value]) => ({
      key,
      ...value,
      documentCount: value.documents.length,
    })
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Dokumen Kepegawaian
        </h1>
        <p className="text-gray-600">
          Tahap ini memerlukan 5 dokumen resmi kepegawaian. Pastikan semua
          dokumen dalam format PDF dengan ukuran maksimal 2MB per file.
        </p>
      </div>

      {/* Document Groups */}
      <div className="space-y-4 mb-8">
        {documentGroups.map((group) => (
          <button
            key={group.key}
            onClick={() => onNext(group.key)}
            className="w-full group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg hover:bg-blue-50/30"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
                  {group.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {group.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {group.documentCount} dokumen yang diperlukan
                </p>
              </div>

              <div className="ml-6 flex-shrink-0">
                <ChevronRight
                  size={24}
                  className="text-gray-400 group-hover:text-blue-600 transition-colors"
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
        <div className="text-amber-600 text-lg mt-0.5">⚠️</div>
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Perhatian:</p>
          <p>
            Pastikan semua dokumen sudah sesuai dengan persyaratan yang
            ditentukan sebelum melanjutkan ke tahap berikutnya.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
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

