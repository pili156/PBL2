"use client";

import { useState } from "react";
import { Book, GraduationCap, Award, Wallet, MapPin } from "lucide-react";
import { StudyType, FundingType, StudyRegion } from "../type";
import { STUDY_TYPES, FUNDING_TYPES, STUDY_REGIONS } from "../constants";

type Props = {
  onNext: (data: { studyType: StudyType; fundingType: FundingType; studyRegion: StudyRegion }) => void;
};

const ICON_MAP = {
  GraduationCap,
  Book,
  Award,
  Wallet,
  MapPin,
};

export default function Step1JenisStudi({ onNext }: Props) {
  const [studyType, setStudyType] = useState<StudyType | null>(null);
  const [fundingType, setFundingType] = useState<FundingType | null>(null);
  const [studyRegion, setStudyRegion] = useState<StudyRegion | null>(null);

  const handleNext = () => {
    if (studyType && fundingType && studyRegion) {
      onNext({ studyType, fundingType, studyRegion });
    }
  };

  const isComplete = studyType && fundingType && studyRegion;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Pengajuan Studi Lanjut
        </h1>
        <p className="text-gray-600">
          Lengkapi informasi pengajuan studi lanjut Anda dengan memilih jenis studi dan jalur pendanaan
        </p>
      </div>

      {/* Step 1: Study Type */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            01
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pilih jenis studi</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {STUDY_TYPES.map((type) => {
            const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
            const isSelected = studyType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setStudyType(type.id as StudyType)}
                className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg ${
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

                {/* Content */}
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

      {/* Step 2: Funding Type */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            02
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
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
                className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg ${
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

                {/* Content */}
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

      {/* Step 3: Study Region */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
            03
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
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
                className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg ${
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

                {/* Content */}
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

      {/* Info Box */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <div className="text-blue-600 mt-0.5">ℹ️</div>
        <p className="text-sm text-blue-900">
          Anda dapat menyimpan draf ini dan melanjutkannya nanti.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-3">
        <button
          disabled={!isComplete}
          onClick={handleNext}
          className={`px-8 py-3 rounded-lg font-semibold transition-all ${
            isComplete
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Lanjutkan Pengajuan
        </button>
      </div>
    </div>
  );
}