"use client";

import { useState } from "react";
import Step1JenisStudi from "./components/Step1JenisStudi";
import Step2Dokumen from "./components/Step2Dokumen";
import ProgressSidebar from "./components/ProgressSidebar";

export default function PengajuanPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex gap-6">
      {/* CONTENT */}
      <div className="flex-1 bg-gray-50 p-6 rounded-xl">
        {step === 1 && <Step1JenisStudi next={() => setStep(2)} />}
        {step === 2 && (
          <Step2Dokumen
            next={() => setStep(3)}
            prev={() => setStep(1)}
          />
        )}
      </div>

      {/* SIDEBAR */}
      <ProgressSidebar step={step} />
    </div>
  );
}