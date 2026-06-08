"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6 p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">!</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Terjadi Kesalahan</h1>
      <p className="text-sm text-slate-500 max-w-md text-center">
        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
