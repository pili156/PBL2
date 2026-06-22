"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, GraduationCap } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { deklarasiStudiSelesai } from "@/app/actions/pengajuan";

interface Step {
  label: string;
  sub: string;
  done: boolean;
}

interface TimelineStepsProps {
  pengajuanId: number;
  steps: Step[];
  basePath: string;
}

export default function TimelineSteps({
  pengajuanId,
  steps,
  basePath,
}: TimelineStepsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelesai = async () => {
    setLoading(true);
    try {
      await deklarasiStudiSelesai(pengajuanId, basePath);
      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setLoading(false);
    }
  };

  const isSelesaiDone = steps[steps.length - 1]?.done ?? false;

  return (
    <>
      <div className="overflow-x-auto">
        <div className="relative min-w-[540px]">
          <div className="absolute inset-x-0 flex" style={{ top: "24px" }}>
            {steps.map((step, i) => (
              <div key={i} className="flex-1 flex">
                <div
                  className={`flex-1 h-1 ${
                    i === 0
                      ? "invisible"
                      : steps[i - 1].done
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                  }`}
                />
                <div
                  className={`flex-1 h-1 ${
                    i === steps.length - 1
                      ? "invisible"
                      : step.done
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center"
                >
                  {isLast ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md relative z-10 transition-all duration-500 cursor-pointer hover:scale-110 ${
                        step.done
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200"
                      }`}
                      title="Klik untuk deklarasi studi selesai"
                    >
                      {step.done ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </button>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md relative z-10 transition-all duration-500 ${
                        step.done
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-slate-400"
                      }`}
                    >
                      {step.done ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </div>
                  )}
                  <p className="text-[11px] font-semibold text-slate-700 leading-tight mt-3 text-center whitespace-nowrap">
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 text-center whitespace-nowrap">
                    {step.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        onConfirm={handleSelesai}
        title="Deklarasi Studi Selesai?"
        message={
          isSelesaiDone
            ? "Status studi sudah dideklarasi selesai. Tindakan ini tidak akan mengubah status."
            : "Dengan menekan tombol ini, status pengajuan studi akan diubah menjadi 'Studi Selesai'."
        }
        loading={loading}
      />
    </>
  );
}
