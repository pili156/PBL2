type Props = {
  step: number;
};

export default function ProgressSidebar({ step }: Props) {
  const steps = [
    "Kesehatan & rekomendasi",
    "Dokumen Identitas & Keluarga",
    "Dokumen Legalitas Kepegawaian",
    "Dokumen Akademik & Institusi Tujuan",
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm w-72">
      <h3 className="font-semibold mb-4">PROGRESS TAHAPAN</h3>

      <div className="flex flex-col gap-4">
        {steps.map((s, i) => {
          const index = i + 1;
          return (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded border ${
                  step === index
                    ? "border-blue-500 text-blue-500"
                    : "border-gray-300"
                }`}
              >
                {index}
              </div>
              <div>
                <p
                  className={`text-sm ${
                    step === index ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {index}. {s}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}