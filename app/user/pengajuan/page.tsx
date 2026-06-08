"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";
import Step1JenisStudi from "./components/Step1JenisStudi";
import Step2Dokumen from "./components/Step2Dokumen";
import Step3DocumentUpload from "./components/Step3DocumentUpload";
import StepCompleted from "./components/StepCompleted";
import DocumentStatusList from "./components/DocumentStatusList";
import ProgressSidebar from "./components/ProgressSidebar";
import { PengajuanFormData, DocumentType, UploadFile } from "./type";
import { DOCUMENT_GROUPS, DOCUMENT_TYPE_TO_MASTER_ID } from "./constants";

type MasterData = {
  id: number;
  nama_jenis?: string;
  nama_pendanaan?: string;
  nama_wilayah?: string;
  nama_dokumen?: string;
  is_mandatory?: boolean;
  syarat_wilayah?: string;
};

const initialDocuments = Object.keys(DOCUMENT_GROUPS).reduce((acc, group) => {
  const docs = DOCUMENT_GROUPS[group as keyof typeof DOCUMENT_GROUPS].documents;
  docs.forEach((doc) => {
    acc[doc.id] = null;
  });
  return acc;
}, {} as Record<DocumentType, null>);

type FlowStep = "step1" | "step2" | "step3" | "completed";
type DocumentGroup = keyof typeof DOCUMENT_GROUPS;

const COMPLETED_STATUSES = ['diterima', 'terverifikasi'];

export default function PengajuanPage() {
  const router = useRouter();
  const [flowStep, setFlowStep] = useState<FlowStep>("step1");
  const [currentDocumentGroup, setCurrentDocumentGroup] = useState<DocumentGroup>("kesehatan");
  const [formData, setFormData] = useState<PengajuanFormData>({
    documents: initialDocuments,
  });
  const [pengajuanId, setPengajuanId] = useState<number | null>(null);
  const [masterData, setMasterData] = useState<{
    jenisStudi: MasterData[];
    jalurPendanaan: MasterData[];
    wilayah: MasterData[];
  }>({ jenisStudi: [], jalurPendanaan: [], wilayah: [] });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedPengajuan, setHasCompletedPengajuan] = useState(false);

  useEffect(() => {
    async function fetchMasterData() {
      try {
        const res = await fetch('/api/master-data');
        const data = await res.json();
        setMasterData({
          jenisStudi: data.jenisStudi || [],
          jalurPendanaan: data.jalurPendanaan || [],
          wilayah: data.wilayah || [],
        });
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      }
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    async function checkExistingPengajuan() {
      try {
        const response = await fetch('/api/user/pengajuan');
        
        //
        
        if (response.status === 404) {
          //
          setIsInitialized(true);
          return;
        }

        if (response.status === 401) {
          //
          router.push('/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          //
          
          if (COMPLETED_STATUSES.includes(data.status)) {
            //
            setHasCompletedPengajuan(true);
            setFlowStep("completed");
          } else {
            const hasDocuments = data.dokumen && data.dokumen.length > 0;
            const hasSk = data.sk && data.sk.file_sk_path;
            
            if (hasDocuments || hasSk) {
              //
              setHasCompletedPengajuan(true);
              setFlowStep("completed");
            } else {
              //
              await fetch('/api/user/pengajuan', { method: 'DELETE' });
            }
          }
        }
      } catch (error) {
        console.error('Error checking pengajuan:', error);
      } finally {
        setIsInitialized(true);
      }
    }
    checkExistingPengajuan();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (flowStep !== "step1" && flowStep !== "completed" && pengajuanId === null) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flowStep, pengajuanId]);

  const documentGroupOrder: DocumentGroup[] = ["kesehatan", "identitas", "kepegawaian", "akademik"];
  const currentGroupIndex = documentGroupOrder.indexOf(currentDocumentGroup);
  const progressStep = flowStep === "step1" ? 0 : flowStep === "step2" ? 1 : flowStep === "step3" ? currentGroupIndex + 1 : 5;

  const handleStep1Next = async (data: {
    studyType: string;
    fundingType: string;
    studyRegion: string;
    perguruanTinggi: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DEBUG] Input from Step1:', data);
      console.log('[DEBUG] masterData.jalurPendanaan:', masterData.jalurPendanaan);
      
      const selectedJenisStudi = masterData.jenisStudi.find(
        (j) => j.nama_jenis?.toLowerCase().includes(data.studyType.toLowerCase().replace(/_/g, ' '))
      );
      const selectedJalurPendanaan = masterData.jalurPendanaan.find(
        (j) => j.nama_pendanaan?.toLowerCase().includes(data.fundingType.toLowerCase())
      );
      const selectedWilayah = masterData.wilayah.find(
        (w) => w.nama_wilayah?.toLowerCase().includes(data.studyRegion.toLowerCase().replace(/_/g, ' '))
      );

      console.log('[DEBUG] selectedJenisStudi:', selectedJenisStudi);
      console.log('[DEBUG] selectedWilayah:', selectedWilayah);
      console.log('[DEBUG] studyType value:', data.studyType);
      console.log('[DEBUG] studyRegion value:', data.studyRegion);
      console.log('[DEBUG] selectedJalurPendanaan:', selectedJalurPendanaan);
      console.log('[DEBUG] fundingType value:', data.fundingType);

      const response = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_studi_id: selectedJenisStudi?.id,
          jalur_pendanaan_id: selectedJalurPendanaan?.id,
          wilayah_studi: selectedWilayah?.id,
          perguruan_tinggi: data.perguruanTinggi,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      setPengajuanId(result.pengajuan.id);
      setLastSaved(new Date());

      setFormData((prev) => ({
        ...prev,
        studyType: data.studyType as any,
        fundingType: data.fundingType as any,
        studyRegion: data.studyRegion as any,
      }));

      localStorage.removeItem("pengajuan_step1_draft");
      setFlowStep("step2");
    } catch (error: unknown) {
      console.error('Error creating pengajuan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Gagal membuat pengajuan: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = (groupKey: string) => {
    setCurrentDocumentGroup(groupKey as DocumentGroup);
    setFlowStep("step3");
  };

  const handleStep3Next = () => {
    const currentGroupIndex = documentGroupOrder.indexOf(currentDocumentGroup);
    
    if (currentGroupIndex < documentGroupOrder.length - 1) {
      setCurrentDocumentGroup(documentGroupOrder[currentGroupIndex + 1]);
    } else {
      setFlowStep("completed");
    }
  };

  const handleDocumentUpload = async (docType: DocumentType, file: UploadFile, fileObj: File) => {
    if (!pengajuanId) {
      setError('Pengajuan belum dibuat. Silakan lengkapi langkah sebelumnya.');
      return;
    }

    try {
      const masterDokumenId = DOCUMENT_TYPE_TO_MASTER_ID[docType];
      
      const formDataFile = new FormData();
      formDataFile.append('file', fileObj);
      formDataFile.append('master_dokumen_id', masterDokumenId.toString());

      const response = await fetch(`/api/pengajuan/${pengajuanId}/dokumen`, {
        method: 'POST',
        body: formDataFile,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: {
            ...file,
            url: result.filePath,
          },
        },
      }));
      setLastSaved(new Date());
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Gagal mengunggah dokumen: ${errorMessage}`);
    }
  };

  const handleDocumentDelete = (docType: DocumentType) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: null,
      },
    }));
  };

  const handlePrevStep3 = () => {
    setFlowStep("step2");
  };

  const handlePrevStep2 = () => {
    setFlowStep("step1");
  };

  const clearError = () => setError(null);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="flex-1">
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">Terjadi Kesalahan</p>
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            </div>
            <button onClick={clearError} className="text-rose-500 hover:text-rose-700">
              ✕
            </button>
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm min-h-[700px]">
          {flowStep === "step1" && (
            <Step1JenisStudi onNext={handleStep1Next} />
          )}

          {flowStep === "step2" && (
            <Step2Dokumen
              onNext={handleStep2Next}
              onPrev={handlePrevStep2}
            />
          )}

          {flowStep === "step3" && (
            <Step3DocumentUpload
              groupKey={currentDocumentGroup}
              documents={formData.documents}
              onDocumentUpload={handleDocumentUpload}
              onDocumentDelete={handleDocumentDelete}
              onNext={handleStep3Next}
              onPrev={handlePrevStep3}
            />
          )}

          {flowStep === "completed" && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">Pengajuan Berhasil Dikirim</h3>
                  <p className="text-sm text-emerald-700">Pengajuan Anda akan diproses dalam 2-5 hari kerja.</p>
                </div>
              </div>
              <DocumentStatusList />
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => {
                    router.push("/user/dashboard");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all"
                >
                  Kembali
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {flowStep !== "completed" && (
        <ProgressSidebar
          currentStep={flowStep === "step3" ? currentGroupIndex + 1 : 0}
          currentGroup={currentDocumentGroup}
          uploadedFiles={formData.documents}
        />
      )}
    </div>
  );
}
