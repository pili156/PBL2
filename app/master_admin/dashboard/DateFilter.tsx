"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dari = searchParams.get("dari") || "";
  const sampai = searchParams.get("sampai") || "";

  function applyFilter(formData: FormData) {
    const newDari = (formData.get("dari") as string) || "";
    const newSampai = (formData.get("sampai") as string) || "";

    const params = new URLSearchParams();
    if (newDari) params.set("dari", newDari);
    if (newSampai) params.set("sampai", newSampai);

    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname);
  }

  function resetFilter() {
    router.push(window.location.pathname);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applyFilter(new FormData(e.currentTarget));
      }}
      className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200"
    >
      <Calendar className="text-blue-600" size={20} />
      <input
        type="date"
        name="dari"
        defaultValue={dari}
        className="text-sm text-slate-700 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <span className="text-slate-400 text-sm">s.d.</span>
      <input
        type="date"
        name="sampai"
        defaultValue={sampai}
        className="text-sm text-slate-700 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors"
      >
        Filter
      </button>
      {(dari || sampai) && (
        <button
          type="button"
          onClick={resetFilter}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
        >
          Reset
        </button>
      )}
    </form>
  );
}