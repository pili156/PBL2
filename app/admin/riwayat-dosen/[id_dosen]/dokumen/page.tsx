// app/admin/riwayat-dosen/[id_dosen]/dokumen/page.tsx
import { prisma } from '@/src/lib/prisma';
import { FileText, Download, Eye, File, FileSpreadsheet, FileImage, UploadCloud, Plus } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ... (Fungsi fileIcon dan fileColor tetap sama seperti kodinganmu) ...
const fileIcon = (path: string | null | undefined) => {
  if (!path) return File;
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return FileText;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return FileImage;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return FileSpreadsheet;
  return File;
};

const fileColor = (path: string | null | undefined) => {
  if (!path) return 'text-slate-400 bg-slate-100';
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'text-red-600 bg-red-50';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'text-blue-600 bg-blue-50';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'text-emerald-600 bg-emerald-50';
  return 'text-slate-500 bg-slate-100';
};

export default async function DokumenSuratPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // Logika Fetch DB tidak diubah
  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          jenis_studi: true,
          dokumen_pengajuan: { include: { master_dokumen: true } },
          sk_kementerian: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!dosen) notFound();

  const pengajuan = dosen.pengajuan_studi[0] ?? null;

  // Persiapan List Dokumen untuk ditampilkan di tabel
  let allDokumen: any[] = [];
  
  if (pengajuan) {
    const pengajuanRaw = pengajuan as Record<string, unknown>;
    const skKementerian = (pengajuanRaw.sk_kementerian || []) as Record<string, unknown>[];
    const dokPengajuan = (pengajuanRaw.dokumen_pengajuan || []) as Record<string, unknown>[];

    // Masukkan SK ke list (kalau ada)
    skKementerian.forEach(sk => {
      allDokumen.push({
        id: `sk-${sk.id}`,
        name: (sk.nomor_sk as string) || 'SK Tugas Belajar (Pusat)',
        date: sk.tanggal_terbit ? new Date(sk.tanggal_terbit as string) : null,
        path: sk.file_sk_path as string | null,
        jenis: 'SK Kementerian'
      });
    });

    // Masukkan dokumen pendaftaran ke list
    dokPengajuan.forEach(doc => {
      allDokumen.push({
        id: `doc-${doc.id}`,
        name: ((doc.master_dokumen as Record<string, unknown> | null)?.nama_dokumen as string) || 'Dokumen Lainnya',
        date: doc.created_at ? new Date(doc.created_at as string) : null,
        path: doc.file_path as string | null,
        jenis: 'Dokumen Awal'
      });
    });
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER TAB DOKUMEN (Style seperti UI baru) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:px-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Dokumen & Surat</h3>
          <p className="text-xs text-slate-500 mt-1">Dokumen administrasi dan surat-surat terkait studi dosen</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href={`/admin/riwayat-dosen/${idDosen}/dokumen/tambah`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <UploadCloud size={14} /> Upload Dokumen
          </Link>
        </div>
      </div>

      {/* 2 KOLOM: TABEL KIRI & GENERATE SURAT KANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (Tabel List Dokumen) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Sub-Tab Navigation Sesuai UI Baru */}
          <div className="flex border-b border-slate-100 px-4 bg-slate-50/50">
            {['Dokumen Pendaftaran', 'Surat Administrasi', 'Surat Keputusan', 'Lainnya'].map((tab, i) => (
              <button key={i} className={`px-4 py-3 text-xs font-bold transition-all border-b-2 ${i === 0 ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tabel Dokumen */}
          <div className="p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Dokumen Pendaftaran</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-2 w-12 text-center">No</th>
                    <th className="py-3 px-2">Nama Dokumen</th>
                    <th className="py-3 px-2">Tanggal Upload</th>
                    <th className="py-3 px-2 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {allDokumen.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500 text-xs">Belum ada dokumen yang diunggah.</td>
                    </tr>
                  ) : (
                    allDokumen.map((doc, index) => (
                      <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3 px-2 text-xs font-medium text-slate-500 text-center">{index + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${fileColor(doc.path)}`}>
                              {(() => { const Icon = fileIcon(doc.path); return <Icon size={14} />; })()}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-500">{formatDate(doc.date)}</td>
                        <td className="py-3 px-2 flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.path ? (
                            <>
                              <a href={doc.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors">
                                Preview
                              </a>
                              <a href={doc.path} download className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded hover:bg-blue-50 transition-colors">
                                <Download size={14} />
                              </a>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">File Kosong</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (Generate Surat) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#F8FAFC] rounded-xl border border-blue-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Generate Surat</h4>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Admin dapat membuat surat secara otomatis berdasarkan data dokumen dosen yang telah diverifikasi.</p>
            
            <div className="space-y-3">
              {['Surat Keterangan Aktif', 'Surat Pengantar Beasiswa', 'SK Bebas Tugas'].map((surat, idx) => (
                <button key={idx} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:shadow-sm hover:text-blue-600 transition-all group">
                  <span className="flex items-center gap-2"><FileText size={14} className="text-slate-400 group-hover:text-blue-500" /> {surat}</span>
                  <Plus size={14} className="text-slate-300 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}