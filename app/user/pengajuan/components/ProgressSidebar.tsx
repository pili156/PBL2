import { Check, FileText, Clock, AlertCircle, CheckCircle, UploadCloud } from "lucide-react";
import { DocumentType, UploadFile } from "../type";
import { DOCUMENT_GROUPS } from "../constants";

type Props = {
  currentStep: number;
  currentGroup?: string;
  uploadedFiles: Record<DocumentType, UploadFile | null>;
};

const STEP_GROUP_MAP: Record<number, string> = {
  1: "kesehatan",
  2: "identitas",
  3: "kepegawaian",
  4: "akademik",
};

const STEPS = [
  {
    number: 1,
    groupKey: "kesehatan",
    title: "Kesehatan & Rekomendasi",
    subtitle: "Dokter, SK kesehatan, rekomendasi",
  },
  {
    number: 2,
    groupKey: "identitas",
    title: "Identitas & Keluarga",
    subtitle: "Kartu ASN, KK, Akta nikah",
  },
  {
    number: 3,
    groupKey: "kepegawaian",
    title: "Legalitas Kepegawaian",
    subtitle: "KARPEG, SK PNS, JPWK",
  },
  {
    number: 4,
    groupKey: "akademik",
    title: "Akademik & Institusi",
    subtitle: "Ijazah, LoA, Perjanjian",
  },
];

function getGroupDocIds(groupKey: string): DocumentType[] {
  const group = DOCUMENT_GROUPS[groupKey as keyof typeof DOCUMENT_GROUPS];
  if (!group) return [];
  return group.documents
    .filter((doc) => doc.required)
    .map((doc) => doc.id);
}

function getGroupStats(groupKey: string, uploadedFiles: Record<DocumentType, UploadFile | null>) {
  const group = DOCUMENT_GROUPS[groupKey as keyof typeof DOCUMENT_GROUPS];
  if (!group) return { total: 0, uploaded: 0, required: 0 };

  const docs = group.documents;
  const total = docs.length;
  const required = docs.filter(d => d.required).length;
  const uploaded = docs.filter(d => uploadedFiles[d.id] !== null && uploadedFiles[d.id] !== undefined).length;
  const requiredUploaded = docs.filter(d => d.required && uploadedFiles[d.id] !== null && uploadedFiles[d.id] !== undefined).length;

  return { total, uploaded, required, requiredUploaded };
}

function isGroupComplete(
  groupKey: string,
  uploadedFiles: Record<DocumentType, UploadFile | null>
): boolean {
  const group = DOCUMENT_GROUPS[groupKey as keyof typeof DOCUMENT_GROUPS];
  if (!group) return false;
  
  return group.documents
    .filter(doc => doc.required)
    .every(doc => uploadedFiles[doc.id] !== null && uploadedFiles[doc.id] !== undefined);
}

export default function ProgressSidebar({ currentStep, currentGroup, uploadedFiles }: Props) {
  const completedGroups = STEPS.filter((step) => isGroupComplete(step.groupKey, uploadedFiles)).length;
  
  // Dikembalikan ke perhitungan awal (hanya yang wajib)
  const totalRequired = STEPS.reduce((acc, step) => {
    const stats = getGroupStats(step.groupKey, uploadedFiles);
    return acc + stats.required;
  }, 0);
  const totalUploaded = STEPS.reduce((acc, step) => {
    const stats = getGroupStats(step.groupKey, uploadedFiles);
    return acc + (stats.requiredUploaded ?? 0);
  }, 0);
  const totalProgress = totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 0;

  return (
    <div className="w-80 bg-white p-6 rounded-xl shadow-sm sticky top-6 h-fit">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900 text-lg">PROGRESS</h3>
        <span className="text-sm font-semibold text-blue-600">{totalProgress}%</span>
      </div>
      
      {/* Dikembalikan ke teks awal */}
      <p className="text-xs text-gray-500 mb-6">
        {totalUploaded} dari {totalRequired} dokumen wajib terupload
      </p>

      <div className="space-y-1">
        {STEPS.map((step) => {
          const groupKey = step.groupKey;
          const isGroupCompleted = isGroupComplete(groupKey, uploadedFiles);
          const isThisStepActive = currentStep === step.number;
          const stats = getGroupStats(groupKey, uploadedFiles);

          return (
            <div key={step.number} className="relative">
              {step.number < STEPS.length && (
                <div
                  // PERBAIKAN GARIS: menarik garis dari tengah lingkaran atas ke bawah, disembunyikan di belakang lingkaran
                  className={`absolute left-[31px] top-8 -bottom-9 w-0.5 z-0 ${
                    isGroupCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}

              <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                isThisStepActive ? "bg-blue-50 border border-blue-200" : ""
              }`}>
                <div
                  // PERBAIKAN LINGKARAN: ditambahkan "relative z-10" agar menutupi garis yang overlap
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm flex-shrink-0 transition-all ${
                    isGroupCompleted
                      ? "bg-green-500 text-white"
                      : isThisStepActive
                        ? "bg-blue-600 text-white ring-2 ring-blue-200"
                        : stats.uploaded > 0
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                  }`}
                >
                  {isGroupCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : stats.uploaded > 0 ? (
                    <Clock size={16} />
                  ) : (
                    step.number
                  )}
                </div>

                <div className="flex-1 pt-1 min-w-0">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      isGroupCompleted
                        ? "text-green-600"
                        : isThisStepActive
                          ? "text-blue-600"
                          : "text-gray-700"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{step.subtitle}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isGroupCompleted
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${(stats.uploaded / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stats.uploaded}/{stats.total}
                    </span>
                  </div>
                </div>

                {isGroupCompleted && (
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Kemajuan Keseluruhan</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <span className="text-lg font-bold text-blue-600 min-w-[3rem] text-right">
              {totalProgress}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedGroups} dari {STEPS.length} kelompok dokumen selesai
          </p>
        </div>
      </div>
    </div>
  );
}