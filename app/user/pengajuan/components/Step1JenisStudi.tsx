"use client";

import { useState, useEffect } from "react";
import { Book, GraduationCap, Award, Wallet, MapPin, Save, ArrowRight, Loader2, Check, Building2 } from "lucide-react";
import { StudyType, FundingType, StudyRegion } from "../type";
import { STUDY_TYPES, FUNDING_TYPES, STUDY_REGIONS } from "../constants";

type Props = {
  onNext: (data: { studyType: StudyType; fundingType: FundingType; studyRegion: StudyRegion; perguruanTinggi: string }) => void;
};

const ICON_MAP = {
  GraduationCap,
  Book,
  Award,
  Wallet,
  MapPin,
};

interface SelectionState {
  studyType: boolean;
  fundingType: boolean;
  studyRegion: boolean;
}

export default function Step1JenisStudi({ onNext }: Props) {
  const [studyType, setStudyType] = useState<StudyType | null>(null);
  const [fundingType, setFundingType] = useState<FundingType | null>(null);
  const [studyRegion, setStudyRegion] = useState<StudyRegion | null>(null);
  const [perguruanTinggi, setPerguruanTinggi] = useState("");
  const [selections, setSelections] = useState<SelectionState>({ studyType: false, fundingType: false, studyRegion: false });
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pengajuan_step1_draft");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.studyType) setStudyType(data.studyType as StudyType);
        if (data.fundingType) setFundingType(data.fundingType as FundingType);
        if (data.studyRegion) setStudyRegion(data.studyRegion as StudyRegion);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setSelections({ studyType: !!studyType, fundingType: !!fundingType, studyRegion: !!studyRegion });
  }, [studyType, fundingType, studyRegion]);

  useEffect(() => {
    if (studyType && fundingType && studyRegion) {
      setAutoSaveStatus("saving");
      const timer = setTimeout(() => {
        localStorage.setItem("pengajuan_step1_draft", JSON.stringify({ studyType, fundingType, studyRegion, perguruanTinggi }));
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [studyType, fundingType, studyRegion]);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (studyType && fundingType && studyRegion) {
        onNext({ studyType, fundingType, studyRegion, perguruanTinggi });
      }
      setIsAnimating(false);
    }, 300);
  };

  const isComplete = studyType && fundingType && studyRegion;

  const allSelectionsMade = selections.studyType && selections.fundingType && selections.studyRegion;

  const steps = [
    { key: "studyType" as const, label: "Pilih jenis studi", number: 1, isSelected: selections.studyType },
    { key: "fundingType" as const, label: "Pilih jalur pendanaan", number: 2, isSelected: selections.fundingType },
    { key: "studyRegion" as const, label: "Pilih wilayah studi", number: 3, isSelected: selections.studyRegion },
  ];

  return (
    <div className="w-full">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pengajuan Studi Lanjut
          </h1>
          <p className="text-gray-600">
            Lengkapi informasi pengajuan studi lanjut Anda dengan memilih jenis studi dan jalur pendanaan
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {autoSaveStatus === "saving" && (
            <span className="flex items-center gap-2 text-amber-600">
              <Loader2 size={16} className="animate-spin" />
              Menyimpan draf...
            </span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Check size={16} />
              Draf tersimpan
            </span>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                step.isSelected 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-500"
              }`}>
                {step.isSelected && <Check size={14} />}
                {step.label}
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight size={16} className="text-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            01
          </div>
          <h2 className="text-xl font-bold text-gray-900">Pilih jenis studi</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {STUDY_TYPES.map((type) => {
            const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
            const isSelected = studyType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setStudyType(type.id as StudyType)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
                }`}
              >
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <div className="mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg transition-all ${
                      isSelected ? "bg-blue-200" : "bg-gray-100 group-hover:bg-blue-100"
                    }`}
                  >
                    <Icon
                      size={24}
                      className={
                        isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                      }
                    />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            02
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Pilih jalur pendanaan
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {FUNDING_TYPES.map((type) => {
            const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
            const isSelected = fundingType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setFundingType(type.id as FundingType)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
                }`}
              >
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <div className="mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg transition-all ${
                      isSelected ? "bg-blue-200" : "bg-gray-100 group-hover:bg-blue-100"
                    }`}
                  >
                    <Icon
                      size={24}
                      className={
                        isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                      }
                    />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            03
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Pilih Wilayah Studi
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {STUDY_REGIONS.map((region) => {
            const Icon = ICON_MAP[region.icon as keyof typeof ICON_MAP];
            const isSelected = studyRegion === region.id;

            return (
              <button
                key={region.id}
                onClick={() => setStudyRegion(region.id as StudyRegion)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
                }`}
              >
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <div className="mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg transition-all ${
                      isSelected ? "bg-blue-200" : "bg-gray-100 group-hover:bg-blue-100"
                    }`}
                  >
                    <Icon
                      size={24}
                      className={
                        isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                      }
                    />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {region.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {region.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            04
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Perguruan Tinggi Tujuan
          </h2>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Building2 size={20} />
          </span>
          <input
            type="text"
            value={perguruanTinggi}
            onChange={(e) => setPerguruanTinggi(e.target.value)}
            placeholder="Masukkan nama perguruan tinggi tujuan"
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white"
            required
          />
        </div>
      </div>

      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Save size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Draf Disimpan Otomatis</p>
            <p className="text-sm text-gray-600">
              Pilihan Anda disimpan secara otomatis. Anda dapat menutup halaman ini dan melanjutkannya nanti.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          disabled={!isComplete || isAnimating}
          onClick={handleNext}
          className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            isComplete && !isAnimating
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isAnimating && <Loader2 size={20} className="animate-spin" />}
          Lanjutkan Pengajuan
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}