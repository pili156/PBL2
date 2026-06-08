'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

export function GenerateSuratButton() {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClick = () => {
    setFeedback('Fitur generate surat sedang dalam pengembangan');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="relative inline-flex">
      <button onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
        <FileText size={15} /> Generate Surat
      </button>
      {feedback && (
        <div className="absolute top-full mt-2 right-0 px-4 py-2 bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium rounded-lg shadow-sm whitespace-nowrap z-10">
          {feedback}
        </div>
      )}
    </div>
  );
}

export default function GenerateSurat({ namaDosen }: { namaDosen: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClick = (surat: string) => {
    setFeedback(`Fitur generate "${surat}" sedang dalam pengembangan`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">Generate Surat Otomatis</h4>
      <p className="text-xs text-slate-500 mb-5">Buat surat berdasarkan data studi {namaDosen}.</p>

      {feedback && (
        <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium rounded-lg">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {['Surat Aktif Studi', 'Surat Rekomendasi', 'SK Bantuan Studi'].map((surat) => (
          <button key={surat} onClick={() => handleClick(surat)}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all">
            <FileText size={15} /> {surat}
          </button>
        ))}
      </div>
    </div>
  );
}