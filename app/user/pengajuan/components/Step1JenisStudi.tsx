// app/user/pengajuan/components/Step1JenisStudi.tsx
"use client";

import { useState, useEffect } from "react";
import { Book, GraduationCap, Award, Wallet, MapPin, Save, ArrowRight, Loader2, Check, Building2, AlertTriangle } from "lucide-react";
import { StudyType, FundingType, StudyRegion } from "../type";
import { STUDY_TYPES, FUNDING_TYPES, STUDY_REGIONS } from "../constants";
import { getKampusDariDatabase, getBeasiswaDariDatabase } from "../actions";

type Props = {
  onNext: (data: {
    studyType?: StudyType;
    fundingType: FundingType;
    studyRegion: StudyRegion;
    perguruanTinggi: string;
    namaBeasiswa: string;
  }) => void;
  profileIncomplete?: boolean;
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

export default function Step1JenisStudi({ onNext, profileIncomplete = false }: Props) {
  const [studyType, setStudyType] = useState<StudyType | null>(null);
  const [fundingType, setFundingType] = useState<FundingType | null>(null);
  const [studyRegion, setStudyRegion] = useState<StudyRegion | null>(null);
  const [namaBeasiswa, setNamaBeasiswa] = useState("");
  const [perguruanTinggi, setPerguruanTinggi] = useState("");
  const [selections, setSelections] = useState<SelectionState>({ studyType: false, fundingType: false, studyRegion: false });
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isAnimating, setIsAnimating] = useState(false);

  // STATE DATABASE
  const [dbPtn, setDbPtn] = useState<any[]>([]);
  const [dbBeasiswa, setDbBeasiswa] = useState<any[]>([]);
  const [beasiswaCustom, setBeasiswaCustom] = useState("");
  const [ptnCustom, setPtnCustom] = useState("");

  // Ambil data PTN dan Beasiswa dari database
  useEffect(() => {
    getKampusDariDatabase().then((data) => {
      if (data) setDbPtn(data);
    });
    getBeasiswaDariDatabase().then((data) => {
      if (data) setDbBeasiswa(data);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("pengajuan_step1_draft");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.studyType) setStudyType(data.studyType as StudyType);
        if (data.fundingType) setFundingType(data.fundingType as FundingType);
        if (data.studyRegion) setStudyRegion(data.studyRegion as StudyRegion);
        
        if (data.namaBeasiswa) {
          setNamaBeasiswa(data.namaBeasiswa as string);
        }

        if (data.perguruanTinggi) {
          setPerguruanTinggi(data.perguruanTinggi as string);
        }
      } catch (e) {}
    }
  }, []);

  // Deteksi nilai PTN jika custom text
  useEffect(() => {
    if (dbPtn.length > 0 && perguruanTinggi && studyRegion === "dalam_negeri") {
      const isExist = dbPtn.some(pt => pt.nama_pt === perguruanTinggi);
      if (!isExist && perguruanTinggi !== "Lainnya...") {
        setPtnCustom(perguruanTinggi);
        setPerguruanTinggi("Lainnya...");
      }
    }
  }, [dbPtn, studyRegion]);

  // Deteksi nilai Beasiswa jika custom text
  useEffect(() => {
    if (dbBeasiswa.length > 0 && namaBeasiswa && fundingType === "beasiswa") {
      const isExist = dbBeasiswa.some(b => b.nama_beasiswa === namaBeasiswa);
      if (!isExist && namaBeasiswa !== "Lainnya...") {
        setBeasiswaCustom(namaBeasiswa);
        setNamaBeasiswa("Lainnya...");
      }
    }
  }, [dbBeasiswa, fundingType]);

  useEffect(() => {
    if (fundingType === "beasiswa") {
      setNamaBeasiswa((current) => current);
    } else {
      setNamaBeasiswa("");
      setBeasiswaCustom("");
    }

    setStudyType(null);
    setStudyRegion(null);
  }, [fundingType]);

  useEffect(() => {
    setSelections({ studyType: !!studyType, fundingType: !!fundingType, studyRegion: !!studyRegion });
  }, [studyType, fundingType, studyRegion]);

  const getFinalPTN = () => (studyRegion === "dalam_negeri" && perguruanTinggi === "Lainnya...") ? ptnCustom : perguruanTinggi;
  const getFinalBeasiswa = () => namaBeasiswa === "Lainnya..." ? beasiswaCustom : namaBeasiswa;

  useEffect(() => {
    const finalPTN = getFinalPTN();
    const finalBeasiswa = getFinalBeasiswa();

    const canAutoSave =
      fundingType &&
      studyRegion &&
      (fundingType !== "beasiswa" || finalBeasiswa.trim() !== "");

    if (canAutoSave) {
      setAutoSaveStatus("saving");
      const timer = setTimeout(() => {
        localStorage.setItem(
          "pengajuan_step1_draft",
          JSON.stringify({ studyType, fundingType, studyRegion, perguruanTinggi: finalPTN, namaBeasiswa: finalBeasiswa })
        );
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [studyType, fundingType, studyRegion, perguruanTinggi, ptnCustom, namaBeasiswa, beasiswaCustom]);

  const isComplete =
    fundingType &&
    studyRegion &&
    getFinalPTN().trim() !== "" &&
    (fundingType !== "beasiswa" || getFinalBeasiswa().trim() !== "");

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (isComplete) {
        onNext({ 
          studyType: studyType!, 
          fundingType: fundingType!, 
          studyRegion: studyRegion!, 
          perguruanTinggi: getFinalPTN(), 
          namaBeasiswa: fundingType === "beasiswa" ? getFinalBeasiswa() : "" 
        });
      }
      setIsAnimating(false);
    }, 300);
  };

  const allSelectionsMade = selections.studyType && selections.fundingType && selections.studyRegion;
  const shouldShowStudyType = fundingType === "mandiri" || fundingType === "beasiswa";
  const shouldShowRegionAndPT = !!fundingType;

  let stepCounter = 2;
  if (fundingType === "beasiswa") stepCounter++;
  const studyTypeStepNumber = stepCounter;
  if (shouldShowStudyType) stepCounter++;
  const regionStepNumber = stepCounter;
  stepCounter++;
  const ptStepNumber = stepCounter;

  const steps = [
    { key: "fundingType" as const, label: "Pilih jalur pendanaan", number: 1, isSelected: selections.fundingType },
    { key: "studyType" as const, label: "Pilih jenis studi", number: 2, isSelected: selections.studyType },
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

      {fundingType === "beasiswa" && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">02</div>
            <h2 className="text-xl font-bold text-gray-900">Nama Beasiswa</h2>
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Award size={20} />
            </span>
            <select
              value={namaBeasiswa}
              onChange={(e) => setNamaBeasiswa(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-12 pr-10 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white appearance-none"
            >
              <option value="" disabled>Pilih Jenis Beasiswa...</option>
              {dbBeasiswa.map(b => (
                <option key={b.id} value={b.nama_beasiswa}>{b.nama_beasiswa}</option>
              ))}
              <option value="Lainnya...">Lainnya...</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          {namaBeasiswa === "Lainnya..." && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={beasiswaCustom}
                onChange={(e) => setBeasiswaCustom(e.target.value)}
                placeholder="Ketik nama beasiswa secara spesifik..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white"
              />
            </div>
          )}
        </div>
      )}

      {shouldShowStudyType && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">{studyTypeStepNumber}</div>
            <h2 className="text-xl font-bold text-gray-900">Pilih jenis studi</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {STUDY_TYPES.map((type) => {
              const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
              const isSelected = studyType === type.id;
              
              let displayTitle = type.title;
              if (type.id === "tugas_belajar") displayTitle = "Tugas Belajar (Dibebastugaskan)";
              if (type.id === "izin_belajar") displayTitle = "Tugas Belajar (Tetap Menjalankan Kewajiban)";

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setStudyType(type.id as StudyType)}
                  className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
                  }`}>
                  <div
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300 bg-white group-hover:border-blue-400"
                    }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>

                  <div className="mb-4">
                    <div className={`inline-flex p-3 rounded-lg transition-all ${isSelected ? "bg-blue-200" : "bg-gray-100 group-hover:bg-blue-100"}`}>
                      <Icon size={24} className={isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"} />
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{displayTitle}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {shouldShowRegionAndPT && (
        <>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">{regionStepNumber}</div>
              <h2 className="text-xl font-bold text-gray-900">Pilih wilayah studi</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {STUDY_REGIONS.map((region) => {
                const Icon = ICON_MAP[region.icon as keyof typeof ICON_MAP];
                const isSelected = studyRegion === region.id;

                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      setStudyRegion(region.id as StudyRegion);
                      setPerguruanTinggi("");
                      setPtnCustom("");
                    }}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
                    }`}>
                    <div
                      className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 bg-white group-hover:border-blue-400"
                      }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>

                    <div className="mb-4">
                      <div className={`inline-flex p-3 rounded-lg transition-all ${isSelected ? "bg-blue-200" : "bg-gray-100 group-hover:bg-blue-100"}`}>
                        <Icon size={24} className={isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"} />
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{region.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{region.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">{ptStepNumber}</div>
              <h2 className="text-xl font-bold text-gray-900">Perguruan Tinggi Tujuan</h2>
            </div>
            
            {studyRegion === "dalam_negeri" ? (
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Building2 size={20} />
                  </span>
                  <select
                    value={perguruanTinggi}
                    onChange={(e) => setPerguruanTinggi(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-10 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white appearance-none"
                  >
                    <option value="" disabled>Pilih Kampus Dalam Negeri...</option>
                    {dbPtn.map(pt => (
                      <option key={pt.id} value={pt.nama_pt}>{pt.nama_pt}</option>
                    ))}
                    <option value="Lainnya...">Lainnya...</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                
                {perguruanTinggi === "Lainnya..." && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <input
                      type="text"
                      value={ptnCustom}
                      onChange={(e) => setPtnCustom(e.target.value)}
                      placeholder="Ketik nama kampus dalam negeri secara spesifik..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Building2 size={20} />
                </span>
                <input
                  type="text"
                  value={perguruanTinggi}
                  onChange={(e) => setPerguruanTinggi(e.target.value)}
                  placeholder="Masukkan nama perguruan tinggi tujuan di luar negeri..."
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white"
                />
              </div>
            )}
          </div>
        </>
      )}

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

      {profileIncomplete && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Profil Belum Lengkap</p>
            <p className="text-sm text-amber-700 mt-1">
              Silakan lengkapi data profil Anda terlebih dahulu sebelum melanjutkan pengajuan.{" "}
              <a href="/user/profile" className="font-semibold underline hover:text-amber-900">
                Lengkapi Profil
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end items-center gap-4">
        {profileIncomplete && (
          <a
            href="/user/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle size={16} />
            Isi Data Profil
          </a>
        )}
        <button
          disabled={!isComplete || isAnimating || profileIncomplete}
          onClick={handleNext}
          className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            profileIncomplete
              ? "bg-red-100 text-red-600 cursor-not-allowed border border-red-300"
              : isComplete && !isAnimating
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isAnimating && <Loader2 size={20} className="animate-spin" />}
          {profileIncomplete ? "Lengkapi data profile" : "Lanjutkan Pengajuan"}
          {profileIncomplete ? <AlertTriangle size={20} /> : <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}