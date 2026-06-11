"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-xl text-red-600 font-bold">!</span>
      </div>
      <h2 className="text-lg font-bold text-slate-800">Halaman Tidak Dapat Dimuat</h2>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Muat Ulang
      </button>
    </div>
  );
}
