import { Check } from "lucide-react";
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
    title: "Kesehatan & rekomendasi",
    subtitle: "Dokumen kesehatan dasar",
  },
  {
    number: 2,
    groupKey: "identitas",
    title: "Dokumen identitas & keluarga",
    subtitle: "Dokumen pribadi dan keluarga",
  },
  {
    number: 3,
    groupKey: "kepegawaian",
    title: "Dokumen legalitas kepegawaian",
    subtitle: "Dokumen kepegawaian resmi",
  },
  {
    number: 4,
    groupKey: "akademik",
    title: "Dokumen akademik & institusi",
    subtitle: "Dokumen akademik & tujuan",
  },
];

function getGroupRequiredDocIds(groupKey: string): DocumentType[] {
  const group = DOCUMENT_GROUPS[groupKey as keyof typeof DOCUMENT_GROUPS];
  if (!group) return [];
  return group.documents
    .filter((doc) => doc.required)
    .map((doc) => doc.id);
}

function isGroupComplete(
  groupKey: string,
  uploadedFiles: Record<DocumentType, UploadFile | null>
): boolean {
  const requiredDocIds = getGroupRequiredDocIds(groupKey);
  if (requiredDocIds.length === 0) return false;
  
  return requiredDocIds.every(
    (docId) => uploadedFiles[docId] !== null && uploadedFiles[docId] !== undefined
  );
}

export default function ProgressSidebar({ currentStep, currentGroup, uploadedFiles }: Props) {
  return (
    <div className="w-72 bg-white p-6 rounded-xl shadow-sm sticky top-6 h-fit">
      <h3 className="font-bold text-gray-900 mb-1 text-lg">PROGRESS TAHAPAN</h3>
      <p className="text-xs text-gray-500 mb-6">
        Selesaikan setiap tahap untuk melanjutkan
      </p>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const groupKey = step.groupKey;
          const isGroupCompleted = isGroupComplete(groupKey, uploadedFiles);
          const isThisStepActive = currentStep === step.number;

          return (
            <div key={step.number} className="relative">
              {/* Connecting Line */}
              {step.number < STEPS.length && (
                <div
                  className={`absolute left-5 top-12 w-0.5 h-8 ${
                    isGroupCompleted ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}

              <div className="flex items-start gap-3 relative z-10">
                {/* Step Circle */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm flex-shrink-0 transition-all ${
                    isGroupCompleted
                      ? "bg-green-600 text-white"
                      : isThisStepActive
                        ? "bg-blue-600 text-white ring-2 ring-blue-200"
                        : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                  }`}
                >
                  {isGroupCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 pt-1">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      isGroupCompleted
                        ? "text-green-600"
                        : isThisStepActive
                          ? "text-blue-600"
                          : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Progress */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        {(() => {
          const completedGroups = STEPS.filter((step) => isGroupComplete(step.groupKey, uploadedFiles)).length;
          const totalProgress = Math.round(((completedGroups + (currentStep > 0 && currentStep <= 4 && !isGroupComplete(STEP_GROUP_MAP[currentStep], uploadedFiles) ? 1 : 0)) / 4) * 100);
          return (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Kemajuan Keseluruhan
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {totalProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}