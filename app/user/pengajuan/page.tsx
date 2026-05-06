"use client";

import { useState, useEffect } from "react";
import Step1JenisStudi from "./components/Step1JenisStudi";
import Step2Dokumen from "./components/Step2Dokumen";
import Step3DocumentUpload from "./components/Step3DocumentUpload";
import StepCompleted from "./components/StepCompleted";
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

export default function PengajuanPage() {
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

  // Calculate progress step for sidebar
  const documentGroupOrder: DocumentGroup[] = ["kesehatan", "identitas", "kepegawaian", "akademik"];
  const currentGroupIndex = documentGroupOrder.indexOf(currentDocumentGroup);
  const progressStep = flowStep === "step1" ? 0 : flowStep === "step2" ? 1 : flowStep === "step3" ? currentGroupIndex + 1 : 5;

  const handleStep1Next = async (data: {
    studyType: string;
    fundingType: string;
    studyRegion: string;
  }) => {
    setLoading(true);
    try {
      const selectedJenisStudi = masterData.jenisStudi.find(
        (j) => j.nama_jenis?.toLowerCase().replace(/ /g, '_') === data.studyType
      );
      const selectedJalurPendanaan = masterData.jalurPendanaan.find(
        (j) => j.nama_pendanaan?.toLowerCase().replace(/ /g, '_') === data.fundingType
      );
      const selectedWilayah = masterData.wilayah.find(
        (w) => w.nama_wilayah?.toLowerCase().replace(/ /g, '_') === data.studyRegion
      );

      console.log('=== DEBUG CREATE PENGajuan ===');
      console.log('jenis_studi_id:', selectedJenisStudi?.id);
      console.log('jalur_pendanaan_id:', selectedJalurPendanaan?.id);
      console.log('wilayah_studi:', selectedWilayah?.id);

      const response = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_studi_id: selectedJenisStudi?.id,
          jalur_pendanaan_id: selectedJalurPendanaan?.id,
          wilayah_studi: selectedWilayah?.id,
        }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Pengajuan created:', result.pengajuan);

      setPengajuanId(result.pengajuan.id);

      setFormData((prev) => ({
        ...prev,
        studyType: data.studyType as any,
        fundingType: data.fundingType as any,
        studyRegion: data.studyRegion as any,
      }));
      setFlowStep("step2");
    } catch (error: unknown) {
      console.error('Error creating pengajuan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Gagal membuat pengajuan: ${errorMessage}`);
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
      // Move to next group
      setCurrentDocumentGroup(documentGroupOrder[currentGroupIndex + 1]);
    } else {
      // All groups completed, move to completion
      setFlowStep("completed");
    }
  };

  const handleDocumentUpload = async (docType: DocumentType, file: UploadFile, fileObj: File) => {
    if (!pengajuanId) {
      alert('Pengajuan belum dibuat. Silakan lengkapi langkah sebelumnya.');
      return;
    }

    try {
      const masterDokumenId = DOCUMENT_TYPE_TO_MASTER_ID[docType];
      console.log('=== DEBUG UPLOAD FRONTEND ===');
      console.log('docType:', docType);
      console.log('masterDokumenId:', masterDokumenId);
      console.log('pengajuanId:', pengajuanId);
      console.log('file:', file.name);
      
      const formDataFile = new FormData();
      formDataFile.append('file', fileObj);
      formDataFile.append('master_dokumen_id', masterDokumenId.toString());

      const response = await fetch(`/api/pengajuan/${pengajuanId}/dokumen`, {
        method: 'POST',
        body: formDataFile,
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

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
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Gagal mengunggah dokumen: ${errorMessage}`);
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

  return (
    <div className="flex gap-8 min-h-screen bg-gray-50 p-8">
      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white p-8 rounded-xl shadow-sm min-h-[700px]">
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
            <StepCompleted
              onViewStatus={() => {
                // Navigate to status page
                window.location.href = "/user/pengajuan/status";
              }}
              onBackHome={() => {
                // Navigate to dashboard
                window.location.href = "/user/dashboard";
              }}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
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